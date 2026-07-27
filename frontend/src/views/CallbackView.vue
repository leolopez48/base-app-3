<template>
    <div class="callback-page">
        <div class="callback-card">
            <Loader />
            <h2>Redireccionando…</h2>
            <p>Estamos validando tus credenciales, espera un momento.</p>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import useAuth from "../composables/useAuth";
import Loader from "../components/Loader.vue";

const router = useRouter();
const route = useRoute();
const { getAccessToken, getUserInfo } = useAuth();

let verifier = localStorage.getItem("verifier");

onMounted(async () => {
    try {
        const { code, state } = route.query;
        if (!verifier) verifier = state;

        await getAccessToken(verifier, code);
        await getUserInfo();
        router.push("/");
    } catch (error) {
        router.push("/login");
    }
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.callback-page {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-10 $spacing-4;
}

.callback-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-4;
    padding: $spacing-10;
    background: $surface;
    border: 1px solid $border;
    border-radius: $radius-xl;
    text-align: center;
    box-shadow: $shadow-card;
    max-width: 420px;

    h2 {
        margin: 0;
        font-size: $font-size-xl;
        font-weight: $font-weight-semibold;
    }
    p {
        margin: 0;
        color: $text-muted;
        font-size: $font-size-sm;
    }
}
</style>
