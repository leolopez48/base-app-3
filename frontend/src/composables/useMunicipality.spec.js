import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const mocks = vi.hoisted(() => ({
    municipalityGet: vi.fn(),
    municipalityPut: vi.fn(),
    departmentGet: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
}));

vi.mock("../services/municipalityApi", () => ({
    default: {
        get: mocks.municipalityGet,
        post: vi.fn(),
        put: mocks.municipalityPut,
        delete: vi.fn(),
    },
}));

vi.mock("../services/departmentApi", () => ({
    default: { get: mocks.departmentGet },
}));

vi.mock("./useAlert", () => ({
    default: () => ({ alert: { success: mocks.success, error: mocks.error } }),
}));

import useMunicipality from "./useMunicipality";

describe("useMunicipality", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        mocks.municipalityGet.mockResolvedValue({
            data: {
                data: [{
                    id: "municipality-encrypted",
                    name: "Apaneca",
                    department_id: "department-encrypted",
                    department_name: "Ahuachapán",
                }],
                total: 1,
            },
        });
        mocks.departmentGet.mockResolvedValue({
            data: {
                data: [{ id: "department-encrypted", department_name: "Ahuachapán" }],
            },
        });
    });

    it("loads parent options and keeps encrypted ids when updating", async () => {
        mocks.municipalityPut.mockResolvedValue({ data: { message: "Actualizado" } });
        const municipality = useMunicipality();

        await municipality.initialize();
        municipality.editItem(municipality.records.value[0]);
        municipality.editedItem.value.name = "Apaneca actualizada";
        await municipality.save();

        expect(municipality.departmentOptions.value).toEqual([
            { value: "department-encrypted", title: "Ahuachapán" },
        ]);
        expect(mocks.municipalityPut).toHaveBeenCalledWith(
            "/municipality-encrypted",
            {
                name: "Apaneca actualizada",
                department_id: "department-encrypted",
            }
        );
        expect(mocks.success).toHaveBeenCalledWith("Actualizado");
    });
});
