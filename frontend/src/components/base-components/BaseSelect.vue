<template>
    <div class="base-field">
        <v-autocomplete
            v-bind="$attrs"
            :model-value="modelValue"
            class="mt-2"
            variant="outlined"
            hide-details
            @update:model-value="(v) => $emit('update:modelValue', v)"
        />
        <base-error :rules="rules" />
    </div>
</template>

<script>
import BaseError from "./BaseError.vue";

export default {
    name: "BaseSelect",
    components: { BaseError },
    props: {
        rules: {
            type: Object,
            required: true,
        },
        modelValue: {
            required: true,
            type: [String, Number, Array, Object],
        },
    },
};
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.base-field { width: 100%; }
</style>
