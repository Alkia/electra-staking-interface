<template>
    <SpModal :visible="props.open" title="Delegate" @close="$emit('close')" :closeIcon="true">
        <template #body>
            <div class="sp-form" style="margin-top: 30px;">
                <span>Validator</span>
                <span>{{ props.validator.description?.moniker }}</span>
            </div>
            <div class="sp-form">
                <span>Voting Power</span>
                <span>{{ formatNativeToken(props.validator.tokens) }} {{ COIN_DENOM }}</span>
            </div>
            <div class="sp-form">
                <span>Commission</span>
                <span>
                    {{
                    (Number(props.validator.commission?.commission_rates?.rate) * 100).toFixed(2)
                    }}%
                </span>
            </div>
            <div class="sp-form">
                <span>Amount to Stake</span>
                <input type="number" class="input" v-model="amount" />
            </div>
        </template>

        <template #footer>
            <SpButton type="primary" @click="submit" :disabled="false">Delegate</SpButton>
            <SpButton type="secondary" @click="$emit('close')">Cancel</SpButton>
        </template>
    </SpModal>
</template>

<script lang="ts" setup>
import { SpButton, SpModal } from '@starport/vue';
import { ref } from 'vue';
import { Validator } from '../types';
import { getNativeTokenAmountFromBalances, formatNativeToken, toMinDenom, COIN_DENOM, COIN_DENOM_MIN } from "../../../utils";

/**
 * Define Props and Emits
 */

interface Props {
    open: boolean;
    validator: Validator;
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'submit']);

/**
 * Variables
 */

const amount = ref(0);

/**
 * Define Methods
 */

const submit = () => {
    emit('submit', amount.value);
};
</script>

<style lang="scss">
.sp-form {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 30px;
    align-items: center;
    font-size: 15px;

    input {
        width: 150px;
    }
}

.input {
    margin-top: 4px;
    // padding: 12px 16px;
    height: 30px;
    background-color: rgba(0, 0, 0, 0.03);
    border-radius: 10px;
    font-family: Inter;
    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 130%;
    color: #000000;
    width: 100%;
    outline: 0;
    transition: background-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    display: block;

    &:not([disabled]) {
        &:hover {
            background: rgba(0, 0, 0, 0.07);
        }
    }

    &:focus {
        background: rgba(0, 0, 0, 0.07);
        color: #000;
    }

    &.error {
        box-shadow: 0 0 0 1px rgba(254, 71, 95, 1);
    }
}
</style>