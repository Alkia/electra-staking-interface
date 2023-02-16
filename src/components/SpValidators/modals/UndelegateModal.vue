<template>
    <SpModal :visible="props.open" title="Undelegate" @close="$emit('close')" :closeIcon="true">
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
            <SpButton type="primary" @click="submit" :disabled="false">Undelegate</SpButton>
            <SpButton type="secondary" @click="$emit('close')">Cancel</SpButton>
        </template>
    </SpModal>
</template>

<script lang="ts" setup>
import { SpModal } from '@starport/vue';
import { ref } from 'vue';
import { COIN_DENOM, formatNativeToken } from '../../../utils';
import { Validator } from '../types';

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

const submit = () => {
    emit('submit', amount.value);
};
</script>
<style lang="scss">

</style>