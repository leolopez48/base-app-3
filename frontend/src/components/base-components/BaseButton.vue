<script setup>
defineProps({
    title: { type: String, required: true },
    type: {
        type: String,
        default: "primary",
        validator: (v) =>
            ["primary", "secondary", "ghost", "outline", "danger"].includes(v),
    },
    size: {
        type: String,
        default: "md",
        validator: (v) => ["sm", "md", "lg"].includes(v),
    },
    block: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    icon: { type: String, default: null },
    iconAppend: { type: String, default: null },
});

defineEmits(["click"]);
</script>

<template>
    <button
        :class="[
            'btn',
            `btn--${type}`,
            size === 'sm' && 'btn--sm',
            size === 'lg' && 'btn--lg',
            block && 'btn--block',
        ]"
        :disabled="disabled"
        @click="$emit('click', $event)"
    >
        <v-icon v-if="icon" :icon="icon" size="18" />
        <span v-if="title">{{ title }}</span>
        <slot />
        <v-icon v-if="iconAppend" :icon="iconAppend" size="18" />
    </button>
</template>
