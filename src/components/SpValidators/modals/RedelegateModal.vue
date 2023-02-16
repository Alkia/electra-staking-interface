<template>
    <SpModal :visible="props.open" title="Redelegate" @close="$emit('close')" :closeIcon="true">
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
                <span>Target Validator</span>
                <select v-model="target_validator">
                    <option v-for="val in validator_list" :value="val.operator_address">{{
                        validator.description?.moniker
                    }}</option>
                </select>
            </div>
            <div class="sp-form">
                <span>Amount to Redelegate</span>
                <input type="number" class="input" v-model="amount" />
            </div>
        </template>

        <template #footer>
            <SpButton type="primary" @click="submit" :disabled="false">Redelegate</SpButton>
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
    validator_list: Validator[];
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'submit']);

/**
 * Variables
 */

const amount = ref(0);
const target_validator = ref('');

/**
 * Define Methods
 */

const submit = () => {
    emit('submit', amount.value, target_validator.value);
};
</script>

<style lang="scss">

</style>