<template>
    <div class="not-found">
        <div class="not-found__bg" aria-hidden="true">
            <div class="not-found__grid" />
            <div class="not-found__glow" />
        </div>

        <div class="not-found__inner fade-in-up">
            <span class="eyebrow">Error 404</span>
            <h1 class="not-found__title">
                Página <em>no encontrada</em>
            </h1>
            <p class="not-found__sub">
                Lo sentimos, la ruta que buscas no existe o fue movida.
                Verifica la URL o regresa al inicio.
            </p>

            <div class="not-found__actions">
                <RouterLink to="/" class="btn btn--primary btn--lg">
                    <v-icon icon="mdi-home" size="18" />
                    <span>Ir al inicio</span>
                </RouterLink>
                <button class="btn btn--ghost btn--lg" @click="$router.back()">
                    <v-icon icon="mdi-arrow-left" size="18" />
                    <span>Volver</span>
                </button>
            </div>

            <div class="not-found__code">
                <span>4</span>
                <span class="not-found__orbit">
                    <span class="dot dot--a" />
                    <span class="dot dot--b" />
                    <span class="dot dot--c" />
                </span>
                <span>4</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.not-found {
    position: relative;
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-12 $spacing-4;
    isolation: isolate;
    overflow: hidden;
}

.not-found__bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
}

.not-found__grid {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse at center, #000 0%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, #000 0%, transparent 70%);
}

.not-found__glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 700px;
    height: 700px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 212, 255, 0.18), transparent 60%);
    filter: blur(40px);
}

.not-found__inner {
    position: relative;
    max-width: 640px;
    text-align: center;
}

.not-found__title {
    font-size: $font-size-4xl;
    font-weight: $font-weight-bold;
    margin: $spacing-3 0 $spacing-4;
    letter-spacing: -0.03em;
    line-height: 1.05;

    em {
        font-style: normal;
        background: $accent-gradient;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
}

.not-found__sub {
    color: $text-muted;
    font-size: $font-size-md;
    max-width: 480px;
    margin: 0 auto $spacing-6;
}

.not-found__actions {
    display: flex;
    gap: $spacing-3;
    justify-content: center;
    flex-wrap: wrap;
}

.not-found__code {
    margin-top: $spacing-10;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-2;
    font-size: 8rem;
    line-height: 1;
    font-weight: $font-weight-black;
    color: $text-primary;
    letter-spacing: -0.05em;
}

.not-found__orbit {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 130px;
    height: 130px;
    border: 2px solid $border-strong;
    border-radius: 50%;

    .dot {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: $primary;
        box-shadow: 0 0 12px rgba(0, 212, 255, 0.7);
    }
    .dot--a { top: 0;   left: 50%; transform: translate(-50%, -50%); animation: orbit-a 3s ease-in-out infinite; }
    .dot--b { top: 50%; right: 0;    transform: translate(50%, -50%); animation: orbit-b 3s ease-in-out infinite; animation-delay: 1s; }
    .dot--c { bottom: 0; left: 50%;  transform: translate(-50%, 50%); animation: orbit-c 3s ease-in-out infinite; animation-delay: 2s; }
}

@keyframes orbit-a {
    0%, 100% { transform: translate(-50%, -50%); }
    50%      { transform: translate(-150%, -50%); }
}
@keyframes orbit-b {
    0%, 100% { transform: translate(50%, -50%); }
    50%      { transform: translate(50%, 50%); }
}
@keyframes orbit-c {
    0%, 100% { transform: translate(-50%, 50%); }
    50%      { transform: translate(50%, 50%); }
}
</style>
