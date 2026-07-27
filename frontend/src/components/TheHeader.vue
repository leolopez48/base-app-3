<template>
    <v-app-bar
        class="app-header"
        :elevation="0"
        :height="72"
        flat
    >
        <v-container class="d-flex align-center pa-0" fluid style="max-width: 1340px">
            <RouterLink to="/" class="brand d-flex align-center">
                <span class="brand__mark">
                    <v-icon icon="mdi-shield-lock" size="22" />
                </span>
                <span class="brand__text">
                    <span class="brand__name">App</span>
                    <span class="brand__suffix">Template</span>
                </span>
            </RouterLink>

            <nav class="d-none d-md-flex nav-links ms-8">
                <RouterLink to="/" class="nav-link" exact-active-class="nav-link--active">
                    <v-icon icon="mdi-database" size="18" />
                    <span>Bases de datos</span>
                </RouterLink>
                <RouterLink to="/department" class="nav-link" active-class="nav-link--active">
                    <v-icon icon="mdi-domain" size="18" />
                    <span>Departamentos</span>
                </RouterLink>
                <RouterLink to="/municipality" class="nav-link" active-class="nav-link--active">
                    <v-icon icon="mdi-city" size="18" />
                    <span>Municipios</span>
                </RouterLink>
                <RouterLink to="/zone" class="nav-link" active-class="nav-link--active">
                    <v-icon icon="mdi-map-marker-radius" size="18" />
                    <span>Zonas</span>
                </RouterLink>
                <RouterLink to="/test" class="nav-link" active-class="nav-link--active">
                    <v-icon icon="mdi-flask" size="18" />
                    <span>Test</span>
                </RouterLink>
            </nav>

            <v-spacer />

            <template v-if="isLoggedIn">
                <v-menu offset="8">
                    <template #activator="{ props }">
                        <button v-bind="props" class="user-chip">
                            <span class="user-chip__avatar">
                                <v-icon icon="mdi-account" size="18" />
                            </span>
                            <span class="user-chip__name d-none d-sm-inline">
                                {{ user?.name || "Usuario" }}
                            </span>
                            <v-icon icon="mdi-chevron-down" size="18" />
                        </button>
                    </template>

                    <v-list class="user-menu" min-width="200">
                        <v-list-item
                            v-if="user?.email"
                            :title="user.email"
                            :subtitle="user?.name"
                            prepend-icon="mdi-account-circle"
                        />
                        <v-divider class="my-1" />
                        <v-list-item
                            prepend-icon="mdi-logout"
                            title="Cerrar sesión"
                            @click="logout"
                        />
                    </v-list>
                </v-menu>
            </template>

            <template v-else>
                <button class="btn btn--ghost btn--sm" @click="goLogin">
                    <v-icon icon="mdi-login" size="18" />
                    <span class="ms-1">Iniciar sesión</span>
                </button>
            </template>

            <button
                class="mobile-toggle d-flex d-md-none ms-2"
                @click="drawer = !drawer"
                aria-label="Abrir menú"
            >
                <v-icon icon="mdi-menu" size="24" />
            </button>
        </v-container>
    </v-app-bar>

    <v-navigation-drawer
        v-model="drawer"
        temporary
        location="right"
        class="mobile-drawer"
    >
        <div class="d-flex flex-column pa-4">
            <RouterLink to="/" class="mobile-link" @click="drawer = false">
                <v-icon icon="mdi-database" />
                <span>Bases de datos</span>
            </RouterLink>
            <RouterLink to="/department" class="mobile-link" @click="drawer = false">
                <v-icon icon="mdi-domain" />
                <span>Departamentos</span>
            </RouterLink>
            <RouterLink to="/municipality" class="mobile-link" @click="drawer = false">
                <v-icon icon="mdi-city" />
                <span>Municipios</span>
            </RouterLink>
            <RouterLink to="/zone" class="mobile-link" @click="drawer = false">
                <v-icon icon="mdi-map-marker-radius" />
                <span>Zonas</span>
            </RouterLink>
            <RouterLink to="/test" class="mobile-link" @click="drawer = false">
                <v-icon icon="mdi-flask" />
                <span>Test</span>
            </RouterLink>

            <v-divider class="my-3" />

            <template v-if="isLoggedIn">
                <v-list-item
                    v-if="user?.email"
                    :title="user.email"
                    :subtitle="user?.name"
                    prepend-icon="mdi-account-circle"
                />
                <button class="btn btn--ghost mt-2" @click="logout">
                    <v-icon icon="mdi-logout" />
                    <span class="ms-2">Cerrar sesión</span>
                </button>
            </template>
            <template v-else>
                <button class="btn btn--primary" @click="goLogin">
                    <v-icon icon="mdi-login" />
                    <span class="ms-2">Iniciar sesión</span>
                </button>
            </template>
        </div>
    </v-navigation-drawer>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import useAuth from "../composables/useAuth";

const router = useRouter();
const { isLoggedIn, user, logout } = useAuth();

const drawer = ref(false);

const goLogin = () => {
    drawer.value = false;
    router.push("/login");
};
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.app-header {
    background: rgba(10, 10, 20, 0.7) !important;
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border-bottom: 1px solid $border !important;
    color: $text-primary;
}

.brand {
    gap: $spacing-3;
    text-decoration: none;
    color: $text-primary;
    font-weight: $font-weight-bold;

    &__mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border-radius: $radius-md;
        background: $accent-gradient;
        color: $text-on-accent;
        box-shadow: $shadow-glow;
    }

    &__text {
        display: inline-flex;
        align-items: baseline;
        gap: 4px;
        font-size: $font-size-lg;
        letter-spacing: -0.01em;
    }
    &__name {
        color: $text-primary;
    }
    &__suffix {
        color: $primary;
        font-weight: $font-weight-medium;
    }
}

.nav-links {
    display: flex;
    align-items: center;
    gap: $spacing-2;
}

.nav-link {
    display: inline-flex;
    align-items: center;
    gap: $spacing-2;
    padding: 0.5rem 0.95rem;
    color: $text-muted;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    border-radius: $radius-pill;
    transition: color $transition-fast, background $transition-fast, transform $transition-fast;

    &:hover {
        color: $text-primary;
        background: rgba(255, 255, 255, 0.04);
    }

    &--active {
        color: $primary;
        background: $primary-soft;
        box-shadow: inset 0 0 0 1px rgba(0, 212, 255, 0.25);
    }
}

.user-chip {
    display: inline-flex;
    align-items: center;
    gap: $spacing-2;
    padding: 6px 14px 6px 6px;
    border-radius: $radius-pill;
    background: $surface-elevated;
    border: 1px solid $border;
    color: $text-primary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: border-color $transition-fast, background $transition-fast;

    &:hover {
        border-color: rgba(0, 212, 255, 0.4);
        background: $surface-hover;
    }

    &__avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: $accent-gradient;
        color: $text-on-accent;
    }
}

.user-menu :deep(.v-list) {
    background: $surface-elevated;
    border: 1px solid $border-strong;
}

.mobile-toggle {
    background: transparent;
    border: 1px solid $border;
    color: $text-primary;
    width: 40px;
    height: 40px;
    border-radius: $radius-md;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.mobile-link {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    padding: $spacing-3 $spacing-4;
    color: $text-primary;
    border-radius: $radius-md;
    text-decoration: none;
    transition: background $transition-fast;

    &:hover { background: rgba(255, 255, 255, 0.05); }
    &.router-link-active { color: $primary; background: $primary-soft; }
}
</style>
