<template>
    <div class="base-field">
        <v-textarea
            v-bind="$attrs"
            class="mt-2"
            variant="outlined"
            v-model="rules.$model"
            @keyup="validateText()"
        />
        <base-error :rules="rules" />
    </div>
</template>

<script>
import BaseError from "./BaseError.vue";

export default {
    name: "BaseTextArea",
    components: { BaseError },
    props: {
        rules: {
            type: Object,
            default: () => ({}),
        },
    },
};
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.base-field { width: 100%; }
</style>
