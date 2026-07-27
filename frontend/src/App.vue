<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import TheFooter from "./components/TheFooter.vue";
import TheHeader from "./components/TheHeader.vue";
import useAuth from "./composables/useAuth";
import Alert from "@/components/Alert.vue";

const {
    getUserInfo,
    logout,
    state,
    verifier,
    accessToken,
    refreshToken,
} = useAuth();

const route = useRoute();
const isPublicRoute = ref(false);

const computePublic = () => {
    isPublicRoute.value = ["/login", "/callback", "/404"].includes(route.path);
};

watch(() => route.path, computePublic, { immediate: true });

onMounted(async () => {
    accessToken.value = localStorage.getItem("access_token");
    refreshToken.value = localStorage.getItem("refresh_token");
    state.value = localStorage.getItem("state");
    verifier.value = localStorage.getItem("verifier");

    const path = window.location.pathname;
    if (path == "/login" || path == "/callback") {
        return;
    }

    if (!accessToken.value) {
        logout();
        return;
    }

    await getUserInfo();
});
</script>

<template>
    <v-app theme="cssDark">
        <TheHeader v-if="!isPublicRoute" />
        <Alert />

        <v-main class="app-main">
            <RouterView v-slot="{ Component }">
                <transition name="page" mode="out-in">
                    <component :is="Component" />
                </transition>
            </RouterView>
        </v-main>

        <TheFooter v-if="!isPublicRoute" />
    </v-app>
</template>

<style lang="scss">
@use "@/assets/styles/variables" as *;

.app-main {
    background: transparent;
    min-height: 100vh;
}

.page-enter-active,
.page-leave-active {
    transition: opacity 250ms ease, transform 250ms ease;
}
.page-enter-from {
    opacity: 0;
    transform: translateY(8px);
}
.page-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>
