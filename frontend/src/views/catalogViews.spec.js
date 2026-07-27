import { beforeEach, describe, expect, it, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { ref } from "vue";

const mocks = vi.hoisted(() => ({
    departmentAdd: vi.fn(),
    departmentInitialize: vi.fn(),
    municipalityAdd: vi.fn(),
    municipalityInitialize: vi.fn(),
    zoneAdd: vi.fn(),
    zoneInitialize: vi.fn(),
}));

const validation = (fields) => ({
    editedItem: Object.fromEntries(fields.map((field) => [
        field,
        { $model: "", $errors: [] },
    ])),
});

vi.mock("@/composables/useDepartment", () => ({
    default: () => ({
        search: ref(""), dialog: ref(false), dialogDelete: ref(false),
        headers: ref([]), records: ref([]), editedItem: ref({ department_name: "" }),
        loading: ref(false), total: ref(0), formTitle: ref("Nuevo registro"),
        v$: ref(validation(["department_name", "min_dpto", "may_dpto", "cod_dpto"])),
        initialize: mocks.departmentInitialize, getDataFromApi: vi.fn(),
        editItem: vi.fn(), addRecord: mocks.departmentAdd, close: vi.fn(), save: vi.fn(),
        deleteItem: vi.fn(), closeDelete: vi.fn(), deleteItemConfirm: vi.fn(),
    }),
}));

vi.mock("@/composables/useMunicipality", () => ({
    default: () => ({
        search: ref(""), dialog: ref(false), dialogDelete: ref(false),
        headers: ref([]), records: ref([]), editedItem: ref({ name: "" }),
        loading: ref(false), total: ref(0), formTitle: ref("Nuevo registro"),
        departmentOptions: ref([]),
        v$: ref(validation(["name", "department_id"])),
        initialize: mocks.municipalityInitialize, getDataFromApi: vi.fn(),
        loadDepartments: vi.fn(), editItem: vi.fn(), addRecord: mocks.municipalityAdd,
        close: vi.fn(), save: vi.fn(), deleteItem: vi.fn(), closeDelete: vi.fn(),
        deleteItemConfirm: vi.fn(),
    }),
}));

vi.mock("@/composables/useZone", () => ({
    default: () => ({
        search: ref(""), dialog: ref(false), dialogDelete: ref(false),
        headers: ref([]), records: ref([]), editedItem: ref({ name: "" }),
        loading: ref(false), total: ref(0), formTitle: ref("Nuevo registro"),
        departmentOptions: ref([]),
        v$: ref(validation(["name", "department_id"])),
        initialize: mocks.zoneInitialize, getDataFromApi: vi.fn(), editItem: vi.fn(),
        addRecord: mocks.zoneAdd, close: vi.fn(), save: vi.fn(), deleteItem: vi.fn(),
        closeDelete: vi.fn(), deleteItemConfirm: vi.fn(),
    }),
}));

import DepartmentView from "./DepartmentView.vue";
import MunicipalityView from "./MunicipalityView.vue";
import ZoneView from "./ZoneView.vue";

const stubs = {
    "v-icon": true,
    "v-data-table-server": true,
    "v-dialog": true,
    "v-row": true,
    "v-col": true,
    "base-input": true,
    "base-select": true,
};

describe("catalog views", () => {
    beforeEach(() => vi.clearAllMocks());

    it.each([
        [DepartmentView, "Departamentos", mocks.departmentInitialize, mocks.departmentAdd],
        [MunicipalityView, "Municipios", mocks.municipalityInitialize, mocks.municipalityAdd],
        [ZoneView, "Zonas", mocks.zoneInitialize, mocks.zoneAdd],
    ])("renders %s and delegates UI actions to its composable", async (
        component,
        title,
        initialize,
        addRecord,
    ) => {
        const wrapper = shallowMount(component, { global: { stubs } });

        expect(wrapper.text()).toContain(title);
        expect(initialize).toHaveBeenCalledOnce();

        await wrapper.find(".btn--primary").trigger("click");
        expect(addRecord).toHaveBeenCalledOnce();
    });
});
