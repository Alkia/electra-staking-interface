<template>
    <section>
        <h3 class="title">Balance</h3>
        <table class="balance-table">
            <thead>
                <th>Available</th>
                <th>Staked</th>
                <th>Reward</th>
                <th>Unbonding</th>
            </thead>
            <tbody>
                <tr v-if="address != ''">
                    <td>{{ formatNativeToken(state.balance) }} {{ COIN_DENOM }}</td>
                    <td>{{ formatNativeToken(state.staked) }} {{ COIN_DENOM }}</td>
                    <td>{{ formatNativeToken(state.reward) }} {{ COIN_DENOM }}</td>
                    <td>{{ formatNativeToken(state.unbonding) }} {{ COIN_DENOM }}</td>
                </tr>
                <tr v-else>
                    <td>---</td>
                    <td>---</td>
                    <td>---</td>
                    <td>---</td>
                </tr>
            </tbody>
        </table>
    </section>

    <section>
        <h3 class="title">Validators</h3>
        <table class="validator-table">
            <thead>
                <th>Name</th>
                <th>Voting Power</th>
                <th>Commission</th>
                <th>Delegate</th>
                <th>Undelegate</th>
                <th>Redelegate</th>
                <th>Withdraw Reward</th>
            </thead>
            <tbody>
                <tr v-for="(val, index) in validators" :key="index">
                    <td>{{ val.description?.moniker }}</td>
                    <td>{{ formatNativeToken(val.tokens) }} {{ COIN_DENOM }}</td>
                    <td>
                        {{
                        (Number(val.commission?.commission_rates?.rate) * 100).toFixed(2)
                        }}%
                    </td>
                    <td>
                        <a href="#" @click="showDelegateModal(index)">Delegate</a>
                    </td>
                    <td>
                        <a href="#" @click="showUndelegateModal(index)">Undelegate</a>
                    </td>
                    <td>
                        <a href="#" @click="showRedelegateModal(index)">Redelegate</a>
                    </td>
                    <td>
                        <a href="#" @click="showWithdrawModal(index)">Withdraw</a>
                    </td>
                </tr>
            </tbody>
        </table>
    </section>

    <DelegateModal :open="state.modalDelegateOpen" @close="state.modalDelegateOpen = false"
        :validator="validators[activeValidatorID]" @submit="fnDelegate" />
    <RedelegateModal :open="state.modalRedelegateOpen" @close="state.modalRedelegateOpen = false"
        :validator="validators[activeValidatorID]" :validator_list="validators" @submit="fnRedelegate" />
    <UndelegateModal :open="state.modalUndelegateOpen" @close="state.modalUndelegateOpen = false"
        :validator="validators[activeValidatorID]" @submit="fnUndelegate" />
    <WithdrawModal :open="state.modalWithdrawOpen" @close="state.modalWithdrawOpen = false"
        :validator="validators[activeValidatorID]" @submit="fnWithdraw" :claimableAmount="state.claimableAmount" />

    <!-- Begin: Loading Screen -->
    <SpModal :visible="state.modalLoadingOpen" :closeIcon="!state.isLoading" @close="() => {
        if (state.isLoading) return;
        state.modalLoadingOpen = false;
    }">
        <template #header>
            <div></div>
        </template>
        <template #body>
            <p style="text-align: center; font-size: 16px;">{{ state.loadingScreenText }}</p>
        </template>
    </SpModal>
    <!-- End: Loading Screen -->
</template>

<script lang="ts" setup>
import { onMounted, onUpdated, reactive, ref, watch } from "vue";
import { useStore } from "vuex";
import { SpModal } from "@starport/vue";
import {
    Coin,
    Validator,
    QueryValidatorDelegationsResponse,
    QueryDelegationTotalRewardsResponse,
    QueryDelegatorUnbondingDelegationsResponse,
    QueryAllBalancesResponse
} from "./types";
import { getNativeTokenAmountFromBalances, formatNativeToken, toMinDenom, COIN_DENOM, COIN_DENOM_MIN } from "../../utils/index";
import DelegateModal from "./modals/DelegateModal.vue";
import UndelegateModal from "./modals/UndelegateModal.vue";
import { useAddress } from "@starport/vue/src/composables";
import WithdrawModal from "./modals/WithdrawModal.vue";
import RedelegateModal from "./modals/RedelegateModal.vue";

/**
 * Variables
 */

let $s = useStore();
let queryDelegatorDelegations = (opts: any) => $s.dispatch("cosmos.staking.v1beta1/QueryDelegatorDelegations", opts);
let queryValidators = (opts: any) => $s.dispatch("cosmos.staking.v1beta1/QueryValidators", opts);
let queryAllBalances = (opts: any) => $s.dispatch("cosmos.bank.v1beta1/QueryAllBalances", opts);
let queryDelegatorUnbondingDelegations = (opts: any) => $s.dispatch("cosmos.staking.v1beta1/QueryDelegatorUnbondingDelegations", opts);
let queryDelegatorRewards = (opts: any) => $s.dispatch("cosmos.distribution.v1beta1/QueryDelegationTotalRewards", opts);

let initialState = {
    forceUpdate: false,
    modalDelegateOpen: false,
    modalUndelegateOpen: false,
    modalRedelegateOpen: false,
    modalWithdrawOpen: false,

    /** Loading Screen */
    isLoading: false,
    modalLoadingOpen: false,
    loadingScreenText: "",

    // Balance
    balance: 0,
    staked: 0,
    reward: 0,
    unbonding: 0,

    // validator
    claimableAmount: 0,
};
type State = typeof initialState;
let state: State = reactive(initialState);
const validators = ref<Validator[]>([]);
const activeValidatorID = ref(0);
let reqAmount: Coin = {
    amount: "",
    denom: COIN_DENOM_MIN
};

let { address } = useAddress({ $s });

watch(() => address.value, () => {
    updateInfo();
});

/**
 * Methods
 */

const showDelegateModal = (index: number) => {
    if (address.value == "") return;
    activeValidatorID.value = index;
    state.modalDelegateOpen = true;
};

const showUndelegateModal = (index: number) => {
    if (address.value == "") return;
    activeValidatorID.value = index;
    state.modalUndelegateOpen = true;
};

const showRedelegateModal = (index: number) => {
    if (address.value == "") return;
    activeValidatorID.value = index;
    state.modalRedelegateOpen = true;
};

const showWithdrawModal = async (index: number) => {
    if (address.value == "") return;
    let operator_address = validators.value[index].operator_address;

    const res: QueryDelegationTotalRewardsResponse = await queryDelegatorRewards({
        params: { delegator_address: address.value },
    });
    state.claimableAmount = res.rewards.filter(r => r.validator_address == operator_address)
        .reduce((acc, r) => acc + getNativeTokenAmountFromBalances(r.reward), 0);

    activeValidatorID.value = index;
    state.modalWithdrawOpen = true;
};

const fnDelegate = (amount: number) => {
    state.modalDelegateOpen = false;
    reqAmount.amount = toMinDenom(amount).toString();
    let params = {
        value: {
            amount: reqAmount,
            delegatorAddress: address.value,
            validatorAddress: validators.value[activeValidatorID.value].operator_address,
        },
    };
    const fn = () => $s.dispatch("cosmos.staking.v1beta1/sendMsgDelegate", params);
    fnSubmit(fn);
};

const fnUndelegate = (amount: number) => {
    state.modalUndelegateOpen = false;
    reqAmount.amount = toMinDenom(amount).toString();
    let params = {
        value: {
            amount: reqAmount,
            delegatorAddress: address.value,
            validatorAddress: validators.value[activeValidatorID.value].operator_address,
        },
    };
    const fn = () => $s.dispatch("cosmos.staking.v1beta1/sendMsgUndelegate", params);
    fnSubmit(fn);
};

const fnWithdraw = () => {
    state.modalWithdrawOpen = false;
    let params = {
        value: {
            delegatorAddress: address.value,
            validatorAddress: validators.value[activeValidatorID.value].operator_address,
        },
    };
    const fn = () => $s.dispatch("cosmos.distribution.v1beta1/sendMsgWithdrawDelegatorReward", params);
    fnSubmit(fn);
};

const fnRedelegate = (amount: number, target_validator: string) => {
    state.modalRedelegateOpen = false;
    reqAmount.amount = toMinDenom(amount).toString();
    let params = {
        value: {
            amount: reqAmount,
            delegatorAddress: address.value,
            validatorSrcAddress: validators.value[activeValidatorID.value].operator_address,
            validatorDstAddress: target_validator,
        },
    };
    const fn = () => $s.dispatch("cosmos.staking.v1beta1/sendMsgBeginRedelegate", params);
    fnSubmit(fn);
};

const fnSubmit = async (send: any) => {
    state.isLoading = true;
    state.modalLoadingOpen = true;
    state.loadingScreenText = "Please wait ...";
    try {
        const res = await send();
        state.isLoading = false;
        if (res.code != 0) {
            throw new Error();
        }
        state.loadingScreenText = "Success!";
        updateInfo();
    } catch (e) {
        console.error(e);
        state.isLoading = false;
        state.loadingScreenText = "Failed!";
    }
};

const updateInfo = async () => {

    const res = await queryValidators({
        query: { "pagination.limit": "150" },
    });

    validators.value = res.validators.sort(function (a, b) {
        return Number(a.tokens) < Number(b.tokens) ? 1 : -1;
    });

    // Load available, staked, reward, unbonding balances
    if (address.value == "") {
        return;
    }

    /**
     * Available Balance
     */
    const balanceRes: QueryAllBalancesResponse = await queryAllBalances({
        params: { address: address.value },
        options: { subscribe: true },
    });
    state.balance = getNativeTokenAmountFromBalances(balanceRes.balances);

    /**
     * Staked Balance
     */
    const delegationRes: QueryValidatorDelegationsResponse = await queryDelegatorDelegations({
        params: { delegator_addr: address.value },
        options: { subscribe: true },
    });
    state.staked = delegationRes.delegation_responses.reduce((acc, dl) => Number(dl.balance?.amount) + acc, 0);

    /**
     * Reward Balance
     */
    const rewardsRes: QueryDelegationTotalRewardsResponse = await queryDelegatorRewards({
        params: { delegator_address: address.value },
        options: { subscribe: true },
    });
    state.reward = getNativeTokenAmountFromBalances(rewardsRes.total);

    /**
     * Unbonding Balance
     */
    const unbondingRes: QueryDelegatorUnbondingDelegationsResponse = await queryDelegatorUnbondingDelegations({
        params: { delegator_addr: address.value },
        options: { subscribe: true },
    });
    state.unbonding = unbondingRes.unbonding_responses.reduce((acc, ubd) => {
        return ubd.entries.reduce((s, e) => s + Number(e.balance), 0) + acc;
    }, 0);
};

/**
 * Lifecycle
 */

onMounted(() => {
    updateInfo();
});

onUpdated(() => {
    if (state.forceUpdate == true) {
        updateInfo();

        state.forceUpdate = false;
    }
});
</script>

<style lang="scss" scoped>
table.validator-table {
    width: 100%;

    th {
        font-size: 15px;
        text-align: left;
        padding: 10px;
    }

    td {
        font-size: 14px;
        padding: 10px;

        a {
            text-decoration: underline;
            color: blue;
        }
    }
}

table.balance-table {
    // width: 100%;
    border-collapse: collapse;

    th {
        font-size: 15px;
        text-align: left;
    }

    td {
        font-size: 14px;
    }

    th,
    td {
        border: 1px solid;
        border-color: rgba($color: #000000, $alpha: 0.15);
        padding: 10px 20px;
    }
}

.title {
    font-family: Inter, serif;
    font-style: normal;
    font-weight: 600;
    font-size: 28px;
    line-height: 127%;
    /* identical to box height, or 36px */

    letter-spacing: -0.02em;
    font-feature-settings: 'zero';

    color: #000000;
    margin-top: 0;
    margin-bottom: 20px;
}

section {
    position: relative;
    padding-bottom: 100px;
}
</style>