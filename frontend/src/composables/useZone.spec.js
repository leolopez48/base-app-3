import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const mocks = vi.hoisted(() => ({
    zoneGet: vi.fn(),
    zonePost: vi.fn(),
    zonePut: vi.fn(),
    zoneDelete: vi.fn(),
    departmentGet: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
}));

vi.mock("../services/zoneApi", () => ({
    default: {
        get: mocks.zoneGet,
        post: mocks.zonePost,
        put: mocks.zonePut,
        delete: mocks.zoneDelete,
    },
}));

vi.mock("../services/departmentApi", () => ({
    default: { get: mocks.departmentGet },
}));

vi.mock("./useAlert", () => ({
    default: () => ({
        alert: { success: mocks.success, error: mocks.error },
    }),
}));

import useZone from "./useZone";

describe("useZone", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        mocks.zoneGet.mockResolvedValue({
            data: {
                data: [{
                    id: "zone-encrypted",
                    name: "Zona Norte",
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

    it("initializes records and related options in parallel", async () => {
        const zone = useZone();

        await zone.initialize();

        expect(mocks.zoneGet).toHaveBeenCalledOnce();
        expect(mocks.departmentGet).toHaveBeenCalledOnce();
        expect(zone.records.value).toHaveLength(1);
        expect(zone.departmentOptions.value).toEqual([
            { value: "department-encrypted", title: "Ahuachapán" },
        ]);
        expect(zone.loading.value).toBe(false);
    });

    it("preserves encrypted ids and sends only editable fields on update", async () => {
        mocks.zonePut.mockResolvedValue({ data: { message: "Actualizado" } });
        const zone = useZone();
        await zone.initialize();

        zone.editItem(zone.records.value[0]);
        zone.editedItem.value.name = "Zona Actualizada";
        await zone.save();

        expect(mocks.zonePut).toHaveBeenCalledWith("/zone-encrypted", {
            name: "Zona Actualizada",
            department_id: "department-encrypted",
        });
        expect(mocks.success).toHaveBeenCalledWith("Actualizado");
    });

    it("creates and deletes records through the expected endpoints", async () => {
        mocks.zonePost.mockResolvedValue({ data: { message: "Creado" } });
        mocks.zoneDelete.mockResolvedValue({ data: { message: "Eliminado" } });
        const zone = useZone();

        zone.addRecord();
        zone.editedItem.value.name = "Zona Nueva";
        zone.editedItem.value.department_id = "department-encrypted";
        await zone.save();

        expect(mocks.zonePost).toHaveBeenCalledWith(null, {
            name: "Zona Nueva",
            department_id: "department-encrypted",
        });

        await zone.initialize();
        zone.deleteItem(zone.records.value[0]);
        await zone.deleteItemConfirm();

        expect(mocks.zoneDelete).toHaveBeenCalledWith("/zone-encrypted");
        expect(mocks.success).toHaveBeenCalledWith("Eliminado");
    });
});
