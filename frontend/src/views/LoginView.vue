<template>
    <div class="login-page">
        <div class="login-bg" aria-hidden="true">
            <div class="login-bg__grid" />
            <div class="login-bg__glow login-bg__glow--a" />
            <div class="login-bg__glow login-bg__glow--b" />
        </div>

        <div class="login-card fade-in-up text-center">
            <h2 class="login-card__heading">
                <em>Iniciar sesión</em>
            </h2>
            <p class="login-card__sub">Inicia sesión para continuar.</p>

            <button class="btn btn--primary btn--lg btn--block login-card__cta" @click="redirectToProvider">
                <v-icon icon="mdi-login" size="20" />
                <span>Iniciar sesión</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import useAuth from "../composables/useAuth";

const { redirectToProvider } = useAuth();
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.login-page {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-10 $spacing-4;
    isolation: isolate;
    overflow: hidden;
}

.login-bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;

    &__grid {
        position: absolute;
        inset: 0;
        background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
        background-size: 48px 48px;
        mask-image: radial-gradient(ellipse at center, #000 10%, transparent 70%);
        -webkit-mask-image: radial-gradient(ellipse at center, #000 10%, transparent 70%);
        opacity: 0.7;
    }

    &__glow {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.45;

        &--a {
            top: -10%;
            left: -10%;
            width: 540px;
            height: 540px;
            background: var(--color-primary);
        }

        &--b {
            bottom: -15%;
            right: -10%;
            width: 620px;
            height: 620px;
            background: var(--color-secondary);
        }
    }
}

.login-card {
    width: 100%;
    max-width: 420px;
    background: color-mix(in srgb, var(--color-surface) 65%, transparent);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-2xl);
    padding: $spacing-10;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    box-shadow: var(--shadow-lg), 0 0 60px color-mix(in srgb, var(--color-primary) 15%, transparent);
    &__heading {
        font-size: $font-size-2xl;
        font-weight: $font-weight-bold;
        margin: 0 0 $spacing-3;
        letter-spacing: -0.02em;

        em {
            font-style: normal;
            background: var(--color-accent-gradient);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    }

    &__sub {
        color: var(--color-text-muted);
        font-size: $font-size-sm;
        margin: 0 0 $spacing-6;
    }

    &__cta {
        margin-top: $spacing-2;
    }
}
</style>
