<template>
    <div class="muni-page" data-app>
        <section class="muni-page__head">
            <div>
                <span class="eyebrow">Catálogo</span>
                <h1 class="muni-page__title">Municipios</h1>
                <p class="muni-page__sub">
                    Gestiona los municipios disponibles para la organización.
                </p>
            </div>
            <div class="muni-page__actions">
                <button class="btn btn--primary" @click="addRecord">
                    <v-icon icon="mdi-plus" size="18" />
                    <span>Agregar</span>
                </button>
            </div>
        </section>

        <div class="muni-page__toolbar">
            <div class="search-field">
                <v-icon icon="mdi-magnify" size="20" />
                <input
                    v-model="search"
                    type="search"
                    placeholder="Buscar por nombre o departamento..."
                />
            </div>
        </div>

        <div class="muni-card surface">
            <v-data-table-server
                :headers="headers"
                :items-length="total"
                :items="records"
                :loading="loading"
                item-title="id"
                item-value="id"
                @update:options="getDataFromApi"
            >
                <template v-slot:[`item.actions`]="{ item }">
                    <div class="row-actions">
                        <button
                            class="row-actions__btn row-actions__btn--edit"
                            @click="editItem(item.raw)"
                            aria-label="Editar"
                        >
                            <v-icon icon="mdi-pencil" size="18" />
                        </button>
                        <button
                            class="row-actions__btn row-actions__btn--del"
                            @click="deleteItem(item.raw)"
                            aria-label="Eliminar"
                        >
                            <v-icon icon="mdi-delete" size="18" />
                        </button>
                    </div>
                </template>
                <template v-slot:no-data>
                    <div class="empty-state">
                        <v-icon icon="mdi-database-off" size="32" />
                        <p>Sin registros para mostrar.</p>
                        <button class="btn btn--ghost btn--sm" @click="initialize">
                            <v-icon icon="mdi-refresh" size="16" />
                            <span>Recargar</span>
                        </button>
                    </div>
                </template>
            </v-data-table-server>
        </div>

        <!-- Create / Edit dialog -->
        <v-dialog v-model="dialog" max-width="640" persistent>
            <article class="modal-card">
                <header class="modal-card__head">
                    <div>
                        <span class="eyebrow">{{ formTitle }}</span>
                        <h2>{{ formTitle }}</h2>
                    </div>
                    <button class="btn btn--ghost btn--sm" @click="close">
                        <v-icon icon="mdi-close" size="18" />
                    </button>
                </header>
                <section class="modal-card__body">
                    <v-row class="pt-1">
                        <v-col cols="12" md="6">
                            <label class="field-label">Nombre</label>
                            <base-input
                                v-model="v$.editedItem.name.$model"
                                :rules="v$.editedItem.name"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <label class="field-label">Departamento</label>
                            <base-select
                                v-model="v$.editedItem.department_id.$model"
                                :rules="v$.editedItem.department_id"
                                :items="departmentOptions"
                                item-title="title"
                                item-value="value"
                            />
                        </v-col>
                    </v-row>
                </section>
                <footer class="modal-card__foot">
                    <button class="btn btn--ghost" @click="close">Cancelar</button>
                    <button class="btn btn--primary" @click="save">
                        <v-icon icon="mdi-content-save" size="18" />
                        <span>Guardar</span>
                    </button>
                </footer>
            </article>
        </v-dialog>

        <!-- Delete dialog -->
        <v-dialog v-model="dialogDelete" max-width="440">
            <article class="modal-card modal-card--sm">
                <header class="modal-card__head">
                    <div>
                        <span class="eyebrow eyebrow--error">Eliminar</span>
                        <h2>Confirmar eliminación</h2>
                    </div>
                </header>
                <section class="modal-card__body">
                    <p class="text-muted">
                        ¿Estás seguro que deseas eliminar
                        <b class="text-primary">{{ editedItem.name }}</b>?
                        Esta acción no se puede deshacer.
                    </p>
                </section>
                <footer class="modal-card__foot">
                    <button class="btn btn--ghost" @click="closeDelete">Cancelar</button>
                    <button class="btn btn--danger" @click="deleteItemConfirm">
                        <v-icon icon="mdi-delete" size="18" />
                        <span>Eliminar</span>
                    </button>
                </footer>
            </article>
        </v-dialog>
    </div>
</template>

<script setup>
import { onMounted } from "vue";
import useMunicipality from "@/composables/useMunicipality";

import BaseInput from "../components/base-components/BaseInput.vue";
import BaseSelect from "../components/base-components/BaseSelect.vue";

const {
    search,
    dialog,
    dialogDelete,
    headers,
    records,
    editedItem,
    loading,
    total,
    formTitle,
    departmentOptions,
    v$,
    initialize,
    getDataFromApi,
    loadDepartments,
    editItem,
    addRecord,
    close,
    save,
    deleteItem,
    closeDelete,
    deleteItemConfirm,
} = useMunicipality();

onMounted(() => {
    initialize();
    loadDepartments();
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.muni-page {
    max-width: 1340px;
    margin: 0 auto;
    padding: $spacing-10 $spacing-4 $spacing-12;

    &__head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: $spacing-4;
        margin-bottom: $spacing-8;
        flex-wrap: wrap;
    }

    &__title {
        font-size: $font-size-3xl;
        font-weight: $font-weight-bold;
        margin: $spacing-3 0 $spacing-2;
        letter-spacing: -0.02em;
    }

    &__sub {
        color: $text-muted;
        margin: 0;
        max-width: 56ch;
    }

    &__toolbar {
        margin-bottom: $spacing-5;
    }
}

.search-field {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    padding: 0 1rem;
    background: $surface;
    border: 1px solid $border;
    border-radius: $radius-pill;
    color: $text-muted;
    transition: border-color $transition-fast, box-shadow $transition-fast;
    max-width: 420px;

    &:focus-within {
        border-color: rgba(0, 212, 255, 0.5);
        box-shadow: 0 0 0 4px rgba(0, 212, 255, 0.15);
    }

    input {
        flex: 1;
        background: transparent;
        border: 0;
        outline: none;
        height: 44px;
        color: $text-primary;
        font-size: $font-size-sm;

        &::placeholder { color: $text-faded; }
    }
}

.muni-card {
    padding: 0;
    overflow: hidden;
}

.row-actions {
    display: inline-flex;
    align-items: center;
    gap: $spacing-1;
    justify-content: flex-end;

    &__btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: $radius-md;
        background: transparent;
        border: 1px solid $border;
        color: $text-muted;
        cursor: pointer;
        transition: color $transition-fast, background $transition-fast, border-color $transition-fast, transform $transition-fast;

        &:hover { transform: translateY(-1px); }
        &--edit:hover { color: $primary; border-color: rgba(0, 212, 255, 0.4); background: $primary-soft; }
        &--del:hover  { color: $error; border-color: rgba(239, 68, 68, 0.4); background: $error-soft; }
    }
}

.field-label {
    display: block;
    margin-top: $spacing-3;
    margin-bottom: $spacing-1;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: $text-muted;
}

.eyebrow--error {
    color: $error;
    background: $error-soft;
    border-color: rgba(239, 68, 68, 0.3);
}

// Modal
.modal-card {
    background: $surface;
    border: 1px solid $border-strong;
    border-radius: $radius-xl;
    overflow: hidden;
    box-shadow: $shadow-lg;

    &--sm { max-width: 440px; }

    &__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: $spacing-3;
        padding: $spacing-5 $spacing-6;
        border-bottom: 1px solid $border;

        h2 {
            margin: $spacing-2 0 0;
            font-size: $font-size-xl;
            font-weight: $font-weight-semibold;
        }
    }

    &__body {
        padding: $spacing-4 $spacing-6 $spacing-6;
    }

    &__foot {
        display: flex;
        justify-content: flex-end;
        gap: $spacing-2;
        padding: $spacing-4 $spacing-6;
        border-top: 1px solid $border;
        background: $background-soft;
    }
}

.empty-state {
    padding: $spacing-10 $spacing-4;
    text-align: center;
    color: $text-muted;

    .v-icon { color: $text-faded; margin-bottom: $spacing-2; }
    p { margin: 0 0 $spacing-3; }
}
</style>
