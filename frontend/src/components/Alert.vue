<template>
    <transition name="alert">
        <div v-if="show" class="alert" :class="`alert-${type}`" role="alert">
            <span class="alert__icon">
                <v-icon :icon="icon" size="20" />
            </span>
            <span class="alert__message">{{ message }}</span>
            <button class="alert__close" @click="show = false" aria-label="Cerrar">
                <v-icon icon="mdi-close" size="18" />
            </button>
        </div>
    </transition>
</template>

<script setup>
import { computed } from "vue";
import useAlert from "@/composables/useAlert";

const { message, type, show } = useAlert();

const icon = computed(() => {
    switch (type.value) {
        case "alert-success": return "mdi-check-circle";
        case "alert-error":   return "mdi-alert-circle";
        case "alert-warning": return "mdi-alert";
        case "alert-info":    return "mdi-information";
        default:              return "mdi-bell";
    }
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.alert {
    &__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    &__message {
        flex: 1;
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $text-primary;
    }

    &__close {
        background: transparent;
        border: 0;
        color: inherit;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity $transition-fast;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border-radius: $radius-sm;

        &:hover { opacity: 1; background: rgba(255, 255, 255, 0.06); }
    }
}

.alert-enter-active,
.alert-leave-active {
    transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);
}
.alert-enter-from,
.alert-leave-to {
    opacity: 0;
    transform: translateX(20px);
}
</style>
