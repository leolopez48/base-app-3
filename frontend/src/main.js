import { createApp } from "vue";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";

import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { es } from "vuetify/locale";

import App from "./App.vue";
import router from "./router";

// Styles (palette, tokens, vuetify overrides, ui, base)
import "./assets/styles/main.scss";

// =====================================================
// THEME — generic, single source of truth.
// The colors here MUST match _palette.scss so the runtime
// Vuetify theme stays in sync with the CSS custom properties.
// To re-skin the app, change _palette.scss (and the values
// below if needed) — nothing else.
// =====================================================
const themeColors = {
    primary: "#06d889",
    secondary: "#0a8e6a",
    accent: "#06d889",
    success: "#22c55e",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#06b6d4",
};

const darkTheme = {
    dark: true,
    colors: {
        background: "#0a0a14",
        surface: "#13141f",
        "surface-bright": "#1a1c2b",
        "surface-light": "#1a1c2b",
        "surface-variant": "#1f2236",
        "on-surface-variant": "#cbd5e1",
        ...themeColors,
        "primary-darken-1": "#05b876",
        "secondary-darken-1": "#086a4f",
        "on-background": "#f8fafc",
        "on-surface": "#f8fafc",
        "on-primary": "#04130c",
        "on-secondary": "#ffffff",
    },
    variables: {
        "border-color": "#262840",
        "border-opacity": 0.5,
        "high-emphasis-opacity": 0.95,
        "medium-emphasis-opacity": 0.7,
        "disabled-opacity": 0.4,
    },
};

const vuetify = createVuetify({
    components: { ...components },
    directives,
    theme: {
        defaultTheme: "appDark",
        themes: { appDark: darkTheme },
    },
    locale: {
        locale: "es",
        messages: { es },
    },
    icons: {
        defaultSet: "mdi",
    },
    defaults: {
        VBtn:    { rounded: "pill",  variant: "flat",     density: "comfortable" },
        VCard:   { rounded: "lg" },
        VTextField:    { variant: "outlined", density: "comfortable", hideDetails: "auto" },
        VTextarea:     { variant: "outlined", density: "comfortable", hideDetails: "auto" },
        VSelect:       { variant: "outlined", density: "comfortable", hideDetails: "auto" },
        VAutocomplete: { variant: "outlined", density: "comfortable", hideDetails: "auto" },
    },
});

const app = createApp(App);

app.use(createPinia());
app.use(vuetify);
app.use(router);

app.mount("#app");
