<template>
    <div class="dept-page" data-app>
        <section class="dept-page__head">
            <div>
                <span class="eyebrow">Catálogo</span>
                <h1 class="dept-page__title">Departamentos</h1>
                <p class="dept-page__sub">
                    Gestiona los departamentos disponibles para la organización.
                </p>
            </div>
            <div class="dept-page__actions">
                <button class="btn btn--primary" @click="addRecord()">
                    <v-icon icon="mdi-plus" size="18" />
                    <span>Agregar</span>
                </button>
            </div>
        </section>

        <div class="dept-page__toolbar">
            <div class="search-field">
                <v-icon icon="mdi-magnify" size="20" />
                <input v-model="search" type="search" placeholder="Buscar por nombre o código..." />
            </div>
        </div>

        <div class="dept-card surface">
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
        <v-dialog v-model="dialog" max-width="780" persistent>
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
                            <label class="field-label">Department Name</label>
                            <base-input
                                v-model="v$.editedItem.department_name.$model"
                                :rules="v$.editedItem.department_name"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <label class="field-label">Min Dpto</label>
                            <base-input
                                v-model="v$.editedItem.min_dpto.$model"
                                :rules="v$.editedItem.min_dpto"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <label class="field-label">May Dpto</label>
                            <base-input
                                v-model="v$.editedItem.may_dpto.$model"
                                :rules="v$.editedItem.may_dpto"
                            />
                        </v-col>
                        <v-col cols="12" md="6">
                            <label class="field-label">Cod Dpto</label>
                            <base-input
                                v-model="v$.editedItem.cod_dpto.$model"
                                :rules="v$.editedItem.cod_dpto"
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
                        <b class="text-primary">{{ editedItem.department_name }}</b>?
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

<script>
import { useVuelidate } from "@vuelidate/core";
import { messages } from "@/utils/validators/i18n-validators";
import { helpers, minLength, required } from "@vuelidate/validators";

import departmentApi from "@/services/departmentApi";

import BaseInput from "../components/base-components/BaseInput.vue";
import useAlert from "../composables/useAlert";

const { alert } = useAlert();
const langMessages = messages["es"].validations;

export default {
    name: "DepartmentView",
    components: { BaseInput },
    setup() {
        return { v$: useVuelidate() };
    },
    data() {
        return {
            search: "",
            selected: [],
            dialog: false,
            dialogDelete: false,
            headers: [
                { title: "Department Name", key: "department_name" },
                { title: "Min Dpto", key: "min_dpto" },
                { title: "May Dpto", key: "may_dpto" },
                { title: "Cod Dpto", key: "cod_dpto" },
                { title: "Acciones", key: "actions", sortable: false, align: "end" },
            ],
            records: [],
            editedIndex: -1,
            total: 0,
            options: {},
            editedItem: {
                department_name: "",
                min_dpto: "",
                may_dpto: "",
                cod_dpto: "",
            },
            defaultItem: {
                department_name: "",
                min_dpto: "",
                may_dpto: "",
                cod_dpto: "",
            },
            loading: false,
            debounce: 0,
        };
    },

    watch: {
        dialogDelete(val) { val || this.closeDelete(); },
        search(val) { this.getDataFromApi(); },
        dialog(val) { val || this.close(); },
    },

    validations() {
        return {
            editedItem: {
                department_name: { required, minLength: minLength(1) },
                min_dpto: { required, minLength: minLength(1) },
                may_dpto: { required, minLength: minLength(1) },
                cod_dpto: { required, minLength: minLength(1) },
            },
        };
    },

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "Nuevo registro" : "Editar registro";
        },
    },

    created() {
        this.initialize();
    },

    beforeMount() {
        this.getDataFromApi({ page: 1, itemsPerPage: 10, sortBy: [], search: "" });
    },

    methods: {
        async initialize() {
            this.loading = true;
            this.records = [];
            try {
                await this.getDataFromApi();
            } catch (e) {
                alert.error("No fue posible obtener el registro.");
            }
            this.loading = false;
        },

        editItem(item) {
            this.editedIndex = this.records.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialog = true;
        },

        close() {
            this.dialog = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },

        async save() {
            this.v$.$validate();
            if (this.v$.$invalid) {
                alert.error("Campos obligatorios");
                return;
            }

            if (this.editedIndex > -1) {
                const edited = Object.assign(
                    this.records[this.editedIndex],
                    this.editedItem
                );
                try {
                    const { data } = await departmentApi.put(`/${edited.id}`, edited);
                    alert.success(data.message);
                } catch (e) {
                    alert.error("No fue posible actualizar el registro.");
                }
                this.close();
                this.initialize();
                return;
            }

            try {
                const { data } = await departmentApi.post(null, this.editedItem);
                alert.success(data.message);
            } catch (e) {
                alert.error("No fue posible crear el registro.");
            }

            this.close();
            this.initialize();
        },

        deleteItem(item) {
            this.editedIndex = this.records.indexOf(item);
            this.editedItem = Object.assign({}, item);
            this.dialogDelete = true;
        },

        closeDelete() {
            this.dialogDelete = false;
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            });
        },

        async deleteItemConfirm() {
            try {
                const { data } = await departmentApi.delete(`/${this.editedItem.id}`, {
                    params: { id: this.editedItem.id },
                });
                alert.success(data.message);
            } catch (e) {
                this.close();
            }
            this.initialize();
            this.closeDelete();
        },

        getDataFromApi(options) {
            this.loading = true;
            this.records = [];
            clearTimeout(this.debounce);
            this.debounce = setTimeout(async () => {
                try {
                    const { data } = await departmentApi.get(null, {
                        params: { ...options, search: this.search },
                    });
                    this.records = data.data;
                    this.total = data.total;
                    this.loading = false;
                } catch (e) {
                    alert.error("No fue posible obtener los registros.");
                }
            }, 500);
        },

        addRecord() {
            this.dialog = true;
            this.editedIndex = -1;
            this.editedItem = Object.assign({}, this.defaultItem);
            this.v$.$reset();
        },
    },
};
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.dept-page {
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

.dept-card {
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
