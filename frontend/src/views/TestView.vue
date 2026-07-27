<script setup>
import { ref } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { messages } from "@/utils/validators/i18n-validators";
import { helpers, minLength, required, email } from "@vuelidate/validators";

import BaseInput from "@/components/base-components/BaseInput.vue";
import BaseTextArea from "../components/base-components/BaseTextArea.vue";
import BaseSelect from "../components/base-components/BaseSelect.vue";

const langMessages = messages["es"].validations;
const state = ref({
    firstName: "Nombre",
    lastName: "",
    contact: { email: "" },
});

const rules = {
    firstName: {
        required: helpers.withMessage(langMessages.required, required),
        minLength: helpers.withMessage(
            ({ $params }) => langMessages.minLength($params),
            minLength(2)
        ),
    },
    description: {
        required: helpers.withMessage(langMessages.required, required),
        minLength: helpers.withMessage(
            ({ $params }) => langMessages.minLength($params),
            minLength(4)
        ),
    },
    country: {
        required: helpers.withMessage(langMessages.required, required),
        minLength: helpers.withMessage(
            ({ $params }) => langMessages.minLength($params),
            minLength(4)
        ),
    },
};

const v$ = useVuelidate(rules, state);

const validateForm = async () => {
    const result = await v$.value.$validate();
    if (result) {
        console.log("Formulario válido");
    } else {
        console.log("Formulario con errores", v$.$errors);
    }
};
</script>

<template>
    <div class="test-page">
        <header class="test-page__head">
            <span class="eyebrow">Test</span>
            <h1>Laboratorio de componentes</h1>
            <p>Pruebas rápidas para los componentes base (inputs, textarea, select).</p>
        </header>

        <div class="test-card surface">
            <h3>Formulario de prueba</h3>

            <label class="field-label">Primer nombre</label>
            <BaseInput
                v-model="v$.firstName.$model"
                :rules="v$.firstName"
                label="Primer nombre"
            />

            <label class="field-label">Descripción</label>
            <BaseTextArea
                v-model="v$.description.$model"
                :rules="v$.description"
                label="Descripcion"
            />

            <label class="field-label">País</label>
            <base-select
                v-model="v$.country.$model"
                label="País"
                :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']"
                :rules="v$.country"
            />

            <div class="test-page__actions">
                <button class="btn btn--primary" @click="validateForm()">
                    <v-icon icon="mdi-flask" size="18" />
                    <span>Validar</span>
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.test-page {
    max-width: 760px;
    margin: 0 auto;
    padding: $spacing-10 $spacing-4 $spacing-12;

    &__head {
        margin-bottom: $spacing-6;

        h1 {
            font-size: $font-size-3xl;
            font-weight: $font-weight-bold;
            margin: $spacing-3 0 $spacing-2;
            letter-spacing: -0.02em;
        }
        p {
            color: $text-muted;
            margin: 0;
        }
    }

    &__actions {
        margin-top: $spacing-5;
    }
}

.test-card {
    padding: $spacing-6;

    h3 {
        margin: 0 0 $spacing-3;
        font-size: $font-size-lg;
    }
}

.field-label {
    display: block;
    margin-top: $spacing-4;
    margin-bottom: $spacing-1;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: $text-muted;
}
</style>
