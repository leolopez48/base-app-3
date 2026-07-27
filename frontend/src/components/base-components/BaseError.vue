<template>
    <div class="base-errors">
        <div
            v-for="error of rules.$errors"
            :key="error.$uid"
            class="base-errors__item"
        >
            <v-icon icon="mdi-alert-circle" size="16" />
            <span>{{ error.$message }}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: "BaseError",
    props: {
        rules: {
            type: Object,
            required: true,
        },
    },
};
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.base-errors {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 6px;
}

.base-errors__item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: $error;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
}
</style>
