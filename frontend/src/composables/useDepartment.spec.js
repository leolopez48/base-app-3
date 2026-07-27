import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const mocks = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
}));

vi.mock("../services/departmentApi", () => ({
    default: {
        get: mocks.get,
        post: mocks.post,
        put: mocks.put,
        delete: mocks.delete,
    },
}));

vi.mock("./useAlert", () => ({
    default: () => ({ alert: { success: mocks.success, error: mocks.error } }),
}));

import useDepartment from "./useDepartment";

describe("useDepartment", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        mocks.get.mockResolvedValue({
            data: {
                data: [{
                    id: "department-encrypted",
                    department_name: "Ahuachapán",
                    min_dpto: "Ahuachapán",
                    may_dpto: "AHUACHAPÁN",
                    cod_dpto: "01",
                }],
                total: 1,
            },
        });
    });

    it("loads records and preserves the encrypted id during updates", async () => {
        mocks.put.mockResolvedValue({ data: { message: "Actualizado" } });
        const department = useDepartment();

        await department.initialize();
        department.editItem(department.records.value[0]);
        department.editedItem.value.department_name = "Ahuachapán actualizado";
        await department.save();

        expect(mocks.put).toHaveBeenCalledWith("/department-encrypted", {
            department_name: "Ahuachapán actualizado",
            min_dpto: "Ahuachapán",
            may_dpto: "AHUACHAPÁN",
            cod_dpto: "01",
        });
        expect(mocks.success).toHaveBeenCalledWith("Actualizado");
        expect(department.loading.value).toBe(false);
    });

    it("reports API errors and restores loading", async () => {
        mocks.get.mockRejectedValue(new Error("network"));
        const department = useDepartment();

        await department.initialize();

        expect(mocks.error).toHaveBeenCalledWith(
            "No fue posible obtener los departamentos."
        );
        expect(department.loading.value).toBe(false);
    });
});
