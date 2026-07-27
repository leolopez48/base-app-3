import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { useDepartmentStore } from "./department";
import { useMunicipalityStore } from "./municipality";
import { useZoneStore } from "./zone";

describe("catalog stores", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it.each([
        ["department", useDepartmentStore, false],
        ["municipality", useMunicipalityStore, true],
        ["zone", useZoneStore, true],
    ])("keeps %s as state-only with a stable editable id", (_, useStore, related) => {
        const store = useStore();

        expect(store.search).toBe("");
        expect(store.records).toEqual([]);
        expect(store.loading).toBe(false);
        expect(store.editedIndex).toBe(-1);
        expect(store.editedItem).toHaveProperty("id", null);
        expect(store.headers.at(-1)).toMatchObject({ key: "actions", sortable: false });

        if (related) {
            expect(store.departments).toEqual([]);
            expect(store.editedItem).toHaveProperty("department_id", null);
        }

        const customFunctions = Object.entries(store).filter(
            ([key, value]) => !key.startsWith("$")
                && !key.startsWith("_")
                && typeof value === "function"
        );
        expect(customFunctions).toEqual([]);
    });
});
