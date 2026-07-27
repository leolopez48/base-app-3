import { defineStore } from "pinia";
import { ref } from "vue";

const emptyItem = () => ({
    id: null,
    department_name: "",
    min_dpto: "",
    may_dpto: "",
    cod_dpto: "",
});

export const useDepartmentStore = defineStore("department", () => {
    const search = ref("");
    const dialog = ref(false);
    const dialogDelete = ref(false);

    const headers = ref([
        { title: "Department Name", key: "department_name" },
        { title: "Min Dpto", key: "min_dpto" },
        { title: "May Dpto", key: "may_dpto" },
        { title: "Cod Dpto", key: "cod_dpto" },
        { title: "Acciones", key: "actions", sortable: false, align: "end" },
    ]);

    const records = ref([]);
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
        editedIndex,
        total,
        options,
        editedItem,
        defaultItem,
        loading,
        debounce,
    };
});
