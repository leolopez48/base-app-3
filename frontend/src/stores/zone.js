import { defineStore } from "pinia";
import { ref } from "vue";

const emptyItem = () => ({
    id: null,
    name: "",
    department_id: null,
});

export const useZoneStore = defineStore("zone", () => {
    const search = ref("");
    const dialog = ref(false);
    const dialogDelete = ref(false);
    const headers = ref([
        { title: "Nombre", key: "name" },
        { title: "Departamento", key: "department_name" },
        { title: "Acciones", key: "actions", sortable: false, align: "end" },
    ]);
    const records = ref([]);
    const departments = ref([]);
    const editedIndex = ref(-1);
    const total = ref(0);
    const options = ref({ page: 1, itemsPerPage: 10, sortBy: [] });
    const editedItem = ref(emptyItem());
    const defaultItem = ref(emptyItem());
    const loading = ref(false);
    const debounce = ref(null);

    return {
        search,
        dialog,
        dialogDelete,
        headers,
        records,
        departments,
        editedIndex,
        total,
        options,
        editedItem,
        defaultItem,
        loading,
        debounce,
    };
});
