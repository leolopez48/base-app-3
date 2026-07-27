import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useVuelidate } from "@vuelidate/core";
import { minLength, required } from "@vuelidate/validators";

import { useZoneStore } from "../stores/zone";
import useAlert from "./useAlert";
import departmentApi from "../services/departmentApi";
import zoneApi from "../services/zoneApi";

const SEARCH_DEBOUNCE_MS = 500;

const useZone = () => {
    const store = useZoneStore();
    const {
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
        loading,
        debounce,
    } = storeToRefs(store);
    const { alert } = useAlert();

    const rules = {
        editedItem: {
            name: { required, minLength: minLength(1) },
            department_id: { required },
        },
    };
    const v$ = useVuelidate(rules, { editedItem });

    const formTitle = computed(() =>
        editedIndex.value === -1 ? "Nuevo registro" : "Editar registro"
    );
    const departmentOptions = computed(() =>
        departments.value.map((department) => ({
            value: department.id,
            title: department.department_name,
        }))
    );

    const resetForm = () => {
        editedItem.value = { ...store.defaultItem };
        editedIndex.value = -1;
        v$.value.$reset();
    };

    const fetchRecords = async (tableOptions = options.value) => {
        options.value = { ...options.value, ...tableOptions };
        loading.value = true;

        try {
            const { data } = await zoneApi.get(null, {
                params: {
                    ...options.value,
                    search: search.value,
                },
            });
            records.value = data.data;
            total.value = data.total;
        } catch (error) {
            alert.error("No fue posible obtener las zonas.");
        } finally {
            loading.value = false;
        }
    };

    const getDataFromApi = (tableOptions = options.value) => {
        options.value = { ...options.value, ...tableOptions };
        clearTimeout(debounce.value);
        debounce.value = setTimeout(
            () => fetchRecords(options.value),
            SEARCH_DEBOUNCE_MS
        );
    };

    const loadDepartments = async () => {
        try {
            const { data } = await departmentApi.get(null, {
                params: { page: 1, itemsPerPage: -1, sortBy: [] },
            });
            departments.value = data.data;
        } catch (error) {
            alert.error("No fue posible obtener los departamentos.");
        }
    };

    const initialize = async () => {
        await Promise.all([fetchRecords(), loadDepartments()]);
    };

    const addRecord = () => {
        resetForm();
        dialog.value = true;
    };

    const editItem = (item) => {
        editedIndex.value = records.value.indexOf(item);
        editedItem.value = {
            id: item.id,
            name: item.name,
            department_id: item.department_id,
        };
        dialog.value = true;
    };

    const close = () => {
        dialog.value = false;
        resetForm();
    };

    const save = async () => {
        if (!await v$.value.$validate()) {
            alert.error("Campos obligatorios");
            return;
        }

        const payload = {
            name: editedItem.value.name,
            department_id: editedItem.value.department_id,
        };

        try {
            const { data } = editedIndex.value === -1
                ? await zoneApi.post(null, payload)
                : await zoneApi.put(`/${editedItem.value.id}`, payload);

            alert.success(data.message);
            close();
            await fetchRecords();
        } catch (error) {
            alert.error(
                editedIndex.value === -1
                    ? "No fue posible crear el registro."
                    : "No fue posible actualizar el registro."
            );
        }
    };

    const deleteItem = (item) => {
        editedIndex.value = records.value.indexOf(item);
        editedItem.value = {
            id: item.id,
            name: item.name,
            department_id: item.department_id,
        };
        dialogDelete.value = true;
    };

    const closeDelete = () => {
        dialogDelete.value = false;
        resetForm();
    };

    const deleteItemConfirm = async () => {
        if (!editedItem.value.id) {
            closeDelete();
            return;
        }

        try {
            const { data } = await zoneApi.delete(`/${editedItem.value.id}`);
            alert.success(data.message);
            closeDelete();
            await fetchRecords();
        } catch (error) {
            alert.error("No fue posible eliminar el registro.");
        }
    };

    watch(search, () => getDataFromApi());
    watch(dialog, (isOpen) => {
        if (!isOpen) resetForm();
    });
    watch(dialogDelete, (isOpen) => {
        if (!isOpen) resetForm();
    });

    return {
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
        editItem,
        addRecord,
        close,
        save,
        deleteItem,
        closeDelete,
        deleteItemConfirm,
    };
};

export default useZone;
