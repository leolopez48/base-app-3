<script setup>
import { onMounted, ref } from "vue";
import gatewayApi from "../services/gatewayApi";
import Loader from "./Loader.vue";
import BaseButton from "./base-components/BaseButton.vue";

import { Modal } from "bootstrap";
import useAlert from "../composables/useAlert";

const { alert } = useAlert();

const dbModalRef = ref(null);

const databases = ref([]);
const dbFiltered = ref([]);
const filter = ref("");
const dbSelected = ref({});
const files = ref([]);
const fileSelected = ref(null);
const disableButtons = ref(false);

const loadingDatabases = ref(false);
const loadingFiles = ref(false);
const dialogBd = ref(false);

const stats = ref({
    total: 0,
    mounted: 0,
    drivers: 0,
});

onMounted(async () => {
    await initialize();
});

const initialize = async () => {
    try {
        loadingDatabases.value = true;
        const { data } = await gatewayApi.get(`/credentials/credentials`);

        databases.value = data.data;
        dbFiltered.value = data.data;
        stats.value.total = data.data.length;
        stats.value.drivers = new Set(data.data.map((d) => d.driver)).size;

        loadingDatabases.value = false;
    } catch (error) {
        alert.error("No fue posible obtener las credenciales de datos.");
    }
};

const selectDatabase = async (db) => {
    try {
        disableButtons.value = true;
        loadingFiles.value = true;
        files.value = [];
        dbSelected.value = db;
        fileSelected.value = null;

        const { data } = await gatewayApi.get(`/databases/databases`, {
            params: {
                filter: db.database,
                pageSize: 7,
            },
        });

        files.value = data.data;
        loadingFiles.value = false;
    } catch (error) {
        disableButtons.value = true;
        loadingFiles.value = false;
        files.value = [];
        alert.error("No fue posible obtener los archivos.");
    }
};

const filterDatabase = () => {
    clearValues();
    if (!filter.value) {
        dbFiltered.value = databases.value;
        return;
    }
    dbFiltered.value = databases.value.filter((db) => {
        for (let prop in db) {
            if (
                db[prop]
                    .toString()
                    .toLowerCase()
                    .includes(filter.value.toLowerCase())
            ) {
                return true;
            }
        }
        return false;
    });
};

const selectFile = (file) => {
    fileSelected.value = file;
    disableButtons.value = false;
};

const mountDb = async () => {
    try {
        disableButtons.value = true;
        const params = {
            id: fileSelected.value.id,
            name: fileSelected.value.name,
            databaseName: dbSelected.value.database,
            databaseDriver: dbSelected.value.driver,
        };

        Modal.getInstance(dbModalRef.value)?.hide();

        alert.error(
            `Montando base de datos '${dbSelected.value.database}'. Por favor espere...`,
            -1
        );
        await gatewayApi.post(`/databases/mount`, params);

        alert.success(
            `Base de datos '${dbSelected.value.database}' montada correctamente. Verifica el gestor de datos.`
        );
        stats.value.mounted += 1;
        disableButtons.value = false;
    } catch (error) {
        alert.error("Error" + error.message);
    }
};

const clearValues = () => {
    dbSelected.value = [];
    files.value = [];
    fileSelected.value = null;
};

const driverIcon = (driver) => {
    const d = (driver || "").toLowerCase();
    if (d.includes("postgres")) return "mdi-elephant";
    if (d.includes("mysql")) return "mdi-database";
    if (d.includes("mongo")) return "mdi-leaf";
    if (d.includes("mssql") || d.includes("sqlserver")) return "mdi-microsoft-sql-server";
    if (d.includes("sqlite")) return "mdi-database-outline";
    return "mdi-database";
};
</script>

<template>
    <div class="db-page">
        <!-- HERO -->
        <section class="hero">
            <div class="hero__inner">
                <span class="eyebrow fade-in-up">Bases de datos</span>
                <h1 class="hero__title fade-in-up fade-in-up--delay-1">
                    Gestiona tus <em>bases de datos</em><br />
                    de forma segura
                </h1>
                <p class="hero__subtitle fade-in-up fade-in-up--delay-2">
                    Explora, selecciona y monta las credenciales disponibles
                    para tu entorno de trabajo en un solo lugar.
                </p>

                <div class="db-stats fade-in-up fade-in-up--delay-3">
                    <div class="stat-card">
                        <div class="stat-card__value">{{ stats.total }}</div>
                        <div class="stat-card__label">Credenciales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__value">{{ stats.mounted }}</div>
                        <div class="stat-card__label">Montadas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__value">{{ stats.drivers }}</div>
                        <div class="stat-card__label">Drivers</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- TOOLBAR -->
        <section class="container-toolbar">
            <div class="container-toolbar__row">
                <div class="search-field">
                    <v-icon icon="mdi-magnify" size="20" />
                    <input
                        v-model="filter"
                        type="search"
                        placeholder="Buscar base de datos por nombre, host, driver..."
                        @input="filterDatabase()"
                    />
                    <button
                        v-if="filter"
                        class="search-field__clear"
                        @click="filter = ''; filterDatabase()"
                        aria-label="Limpiar"
                    >
                        <v-icon icon="mdi-close" size="16" />
                    </button>
                </div>
                <BaseButton
                    type="ghost"
                    size="sm"
                    icon="mdi-refresh"
                    title="Recargar"
                    @click="initialize"
                />
            </div>
        </section>

        <!-- GRID -->
        <section class="db-grid">
            <v-row v-if="dbFiltered.length > 0 && !loadingDatabases">
                <v-col
                    v-for="(item, index) in dbFiltered"
                    :key="index"
                    cols="12"
                    sm="6"
                    md="6"
                    lg="4"
                >
                    <article class="db-card surface surface--hover">
                        <header class="db-card__head">
                            <span class="db-card__icon">
                                <v-icon :icon="driverIcon(item.driver)" size="22" />
                            </span>
                            <div class="db-card__heading">
                                <h3>{{ item.database }}</h3>
                                <span class="db-card__driver">{{ item.driver }}</span>
                            </div>
                            <span class="db-card__pill">{{ item.driver }}</span>
                        </header>

                        <ul class="db-card__meta">
                            <li>
                                <v-icon icon="mdi-server" size="14" />
                                <span>{{ item.host }}</span>
                            </li>
                            <li>
                                <v-icon icon="mdi-pound" size="14" />
                                <span>{{ item.port }}</span>
                            </li>
                        </ul>

                        <footer class="db-card__foot">
                            <BaseButton
                                title="Montar"
                                type="primary"
                                size="sm"
                                icon="mdi-database-plus"
                                @click="
                                    selectDatabase(item);
                                    dialogBd = true;
                                "
                            />
                        </footer>
                    </article>
                </v-col>
            </v-row>

            <div
                v-if="dbFiltered.length == 0 && !loadingDatabases"
                class="empty-state"
            >
                <v-icon icon="mdi-database-off" size="40" />
                <h3>No se encontraron bases de datos</h3>
                <p>Ajusta tu búsqueda o recarga la lista.</p>
            </div>

            <div v-if="loadingDatabases" class="loader-wrap">
                <Loader />
                <p>Cargando credenciales…</p>
            </div>
        </section>

        <!-- MODAL -->
        <v-dialog v-model="dialogBd" width="800" persistent>
            <article class="modal-card">
                <header class="modal-card__head">
                    <div>
                        <span class="eyebrow">Montar base de datos</span>
                        <h2>{{ dbSelected.database }}</h2>
                    </div>
                    <button class="btn btn--ghost btn--sm" @click="dialogBd = false">
                        <v-icon icon="mdi-close" size="18" />
                    </button>
                </header>

                <section class="modal-card__body">
                    <h4>Archivos disponibles</h4>
                    <div v-if="files.length > 0" class="files-grid">
                        <button
                            v-for="file in files"
                            :key="file.id"
                            class="file-item"
                            :class="{ 'file-item--active': fileSelected?.id === file.id }"
                            @click="selectFile(file)"
                        >
                            <v-icon
                                :icon="
                                    fileSelected?.id === file.id
                                        ? 'mdi-radiobox-marked'
                                        : 'mdi-radiobox-blank'
                                "
                                size="18"
                            />
                            <span class="file-item__name">{{ file.name }}</span>
                        </button>
                    </div>
                    <div v-else-if="!loadingFiles" class="empty-state empty-state--sm">
                        <v-icon icon="mdi-file-remove" size="28" />
                        <p>Sin archivos por mostrar.</p>
                    </div>

                    <div v-if="fileSelected && !loadingFiles" class="file-selected">
                        <v-icon icon="mdi-check-decagram" size="18" />
                        <span>Archivo seleccionado: <b>{{ fileSelected.name }}</b></span>
                    </div>

                    <div v-if="loadingFiles" class="loader-wrap loader-wrap--sm">
                        <Loader />
                    </div>
                </section>

                <footer class="modal-card__foot">
                    <BaseButton
                        title="Cerrar"
                        type="ghost"
                        size="sm"
                        @click="dialogBd = false"
                    />
                    <BaseButton
                        title="Montar"
                        type="primary"
                        size="sm"
                        icon="mdi-database-plus"
                        :disabled="disableButtons || !fileSelected"
                        @click="mountDb()"
                    />
                </footer>
            </article>
        </v-dialog>
    </div>
</template>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.db-page {
    padding-bottom: $spacing-12;
}

// HERO
.hero {
    position: relative;
    padding: $spacing-16 0 $spacing-10;
    text-align: center;
    isolation: isolate;
    overflow: hidden;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
            radial-gradient(800px 400px at 50% 0%, rgba(0, 212, 255, 0.18), transparent 60%),
            radial-gradient(600px 300px at 80% 40%, rgba(59, 130, 246, 0.15), transparent 70%);
        z-index: -1;
    }
    &::after {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
        background-size: 48px 48px;
        mask-image: radial-gradient(ellipse at center, #000 0%, transparent 70%);
        -webkit-mask-image: radial-gradient(ellipse at center, #000 0%, transparent 70%);
        z-index: -1;
        opacity: 0.5;
    }
}

.hero__inner {
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 $spacing-4;
}

.hero__title {
    font-size: $font-size-4xl;
    font-weight: $font-weight-bold;
    line-height: $line-height-tight;
    margin: $spacing-4 0;
    letter-spacing: -0.03em;

    em {
        font-style: normal;
        background: $accent-gradient;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
}

.hero__subtitle {
    color: $text-muted;
    font-size: $font-size-md;
    max-width: 640px;
    margin: 0 auto $spacing-10;
}

.db-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: $spacing-4;
    max-width: 720px;
    margin: 0 auto;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
}

// TOOLBAR
.container-toolbar {
    max-width: 1340px;
    margin: 0 auto $spacing-6;
    padding: 0 $spacing-4;

    &__row {
        display: flex;
        gap: $spacing-3;
        align-items: center;

        @media (max-width: 640px) {
            flex-direction: column;
            align-items: stretch;
        }
    }
}

.search-field {
    flex: 1;
    display: flex;
    align-items: center;
    gap: $spacing-2;
    padding: 0 1rem;
    background: $surface;
    border: 1px solid $border;
    border-radius: $radius-pill;
    color: $text-muted;
    transition: border-color $transition-fast, box-shadow $transition-fast;

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

    &__clear {
        background: transparent;
        border: 0;
        color: $text-faded;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;

        &:hover { color: $text-primary; background: rgba(255, 255, 255, 0.05); }
    }
}

// GRID
.db-grid {
    max-width: 1340px;
    margin: 0 auto;
    padding: 0 $spacing-4;
}

.db-card {
    padding: $spacing-5;
    height: 100%;
    display: flex;
    flex-direction: column;

    &__head {
        display: flex;
        align-items: center;
        gap: $spacing-3;
        margin-bottom: $spacing-4;
    }

    &__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: $radius-md;
        background: $primary-soft;
        color: $primary;
        border: 1px solid rgba(0, 212, 255, 0.3);
    }

    &__heading {
        flex: 1;
        min-width: 0;

        h3 {
            margin: 0;
            font-size: $font-size-md;
            color: $text-primary;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    &__driver {
        color: $text-muted;
        font-size: $font-size-xs;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }

    &__pill {
        font-size: $font-size-xs;
        font-weight: $font-weight-semibold;
        padding: 4px 10px;
        background: $primary-soft;
        color: $primary;
        border-radius: $radius-pill;
        border: 1px solid rgba(0, 212, 255, 0.2);
    }

    &__meta {
        list-style: none;
        padding: 0;
        margin: 0 0 $spacing-5;
        display: flex;
        flex-direction: column;
        gap: $spacing-2;
        color: $text-muted;
        font-size: $font-size-sm;

        li {
            display: flex;
            align-items: center;
            gap: $spacing-2;

            .v-icon { color: $text-faded; }
        }
    }

    &__foot {
        margin-top: auto;
        display: flex;
        gap: $spacing-2;
        justify-content: flex-end;
    }
}

.empty-state {
    text-align: center;
    padding: $spacing-12 $spacing-4;
    color: $text-muted;
    background: $surface;
    border: 1px dashed $border-strong;
    border-radius: $radius-lg;

    .v-icon { color: $text-faded; margin-bottom: $spacing-3; }
    h3 { color: $text-primary; margin: 0 0 $spacing-2; font-size: $font-size-md; }
    p  { margin: 0; font-size: $font-size-sm; }

    &--sm {
        padding: $spacing-6 $spacing-4;
        .v-icon { margin-bottom: 0; }
    }
}

.loader-wrap {
    text-align: center;
    padding: $spacing-8 $spacing-4;
    color: $text-muted;
    p { margin-top: $spacing-3; font-size: $font-size-sm; }

    &--sm { padding: $spacing-4; }
}

// MODAL
.modal-card {
    background: $surface;
    border: 1px solid $border-strong;
    border-radius: $radius-xl;
    overflow: hidden;
    box-shadow: $shadow-lg;

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
        padding: $spacing-5 $spacing-6;

        h4 {
            font-size: $font-size-sm;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: $text-muted;
            margin: 0 0 $spacing-3;
        }
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

.files-grid {
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
}

.file-item {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    padding: $spacing-3 $spacing-4;
    background: $surface-elevated;
    border: 1px solid $border;
    border-radius: $radius-md;
    color: $text-primary;
    cursor: pointer;
    text-align: left;
    transition: border-color $transition-fast, background $transition-fast, transform $transition-fast;

    &:hover {
        border-color: rgba(0, 212, 255, 0.4);
        background: $surface-hover;
        transform: translateX(2px);
    }

    &--active {
        border-color: $primary;
        background: $primary-soft;
        color: $primary;
        box-shadow: inset 0 0 0 1px rgba(0, 212, 255, 0.4);
    }

    &__name {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
    }
}

.file-selected {
    margin-top: $spacing-4;
    padding: $spacing-3 $spacing-4;
    background: $primary-soft;
    color: $primary;
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: $radius-md;
    font-size: $font-size-sm;
    display: flex;
    align-items: center;
    gap: $spacing-2;
}
</style>
