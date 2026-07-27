import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useVuelidate } from "@vuelidate/core";
import { minLength, required } from "@vuelidate/validators";

import { useDepartmentStore } from "../stores/department";
import useAlert from "./useAlert";
import departmentApi from "../services/departmentApi";

const SEARCH_DEBOUNCE_MS = 500;

const useDepartment = () => {
    const store = useDepartmentStore();
    const {
        search,
        dialog,
        dialogDelete,
        headers,
        records,
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
            department_name: { required, minLength: minLength(1) },
            min_dpto: { required, minLength: minLength(1) },
            may_dpto: { required, minLength: minLength(1) },
            cod_dpto: { required, minLength: minLength(1) },
        },
    };
    const v$ = useVuelidate(rules, { editedItem });
    const formTitle = computed(() =>
        editedIndex.value === -1 ? "Nuevo registro" : "Editar registro"
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
            const { data } = await departmentApi.get(null, {
                params: { ...options.value, search: search.value },
            });
            records.value = data.data;
            total.value = data.total;
        } catch (error) {
            alert.error("No fue posible obtener los departamentos.");
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

    const initialize = () => fetchRecords();

    const addRecord = () => {
        resetForm();
        dialog.value = true;
    };

    const editItem = (item) => {
        editedIndex.value = records.value.indexOf(item);
        editedItem.value = { ...item };
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
            department_name: editedItem.value.department_name,
            min_dpto: editedItem.value.min_dpto,
            may_dpto: editedItem.value.may_dpto,
            cod_dpto: editedItem.value.cod_dpto,
        };

        try {
            const { data } = editedIndex.value === -1
                ? await departmentApi.post(null, payload)
                : await departmentApi.put(`/${editedItem.value.id}`, payload);
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
        editedItem.value = { ...item };
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
            const { data } = await departmentApi.delete(`/${editedItem.value.id}`);
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

export default useDepartment;
