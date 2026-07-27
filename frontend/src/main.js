import { createApp } from "vue";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";

import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { es } from "vuetify/locale";

import App from "./App.vue";
import router from "./router";

// Importing styles
import "./assets/styles/main.scss";

const vuetify = createVuetify({
  components: {
    ...components,
  },
  directives,
  locale: {
    locale: "es",
    messages: { es },
  },
  icons: {
    defaultSet: "mdi", // This is already the default value - only for display purposes
  },
});

const app = createApp(App);

app.use(createPinia());
app.use(vuetify);
app.use(router);

app.mount("#app");
