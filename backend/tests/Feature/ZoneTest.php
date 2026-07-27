<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Zone;
use Database\Seeders\ZoneSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ZoneTest extends TestCase
{
    use RefreshDatabase;

    public function test_zone_schema_relationship_and_soft_delete(): void
    {
        $this->assertTrue(Schema::hasColumns('zone', [
            'id',
            'name',
            'department_id',
            'created_at',
            'updated_at',
            'deleted_at',
        ]));

        $foreignKeys = DB::select("PRAGMA foreign_key_list('zone')");
        $this->assertTrue(collect($foreignKeys)->contains(
            fn ($foreignKey) => $foreignKey->table === 'department'
                && $foreignKey->from === 'department_id'
                && $foreignKey->to === 'id'
        ));

        $department = Department::create([
            'department_name' => 'Departamento de prueba',
            'min_dpto' => 'Departamento de prueba',
            'may_dpto' => 'DEPARTAMENTO DE PRUEBA',
            'cod_dpto' => '99',
        ]);

        $zone = Zone::create([
            'name' => 'Zona de prueba',
            'department_id' => $department->id,
        ]);

        $this->assertSame($department->id, $zone->department->id);
        $this->assertTrue($department->zones->contains($zone));

        $zone->delete();

        $this->assertSoftDeleted('zone', ['id' => $zone->id]);
        $this->assertNull(Zone::find($zone->id));
        $this->assertNotNull(Zone::withTrashed()->find($zone->id));
    }

    public function test_zone_api_validates_relations_and_performs_the_crud(): void
    {
        $department = $this->department('90', 'Departamento Padre');
        $otherDepartment = $this->department('91', 'Departamento Alterno');

        $this->postJson('/api/zone', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'department_id']);

        $this->postJson('/api/zone', [
            'name' => 'Zona Norte',
            'department_id' => $this->encryptId($department->id),
        ])->assertOk();

        $zone = Zone::where('name', 'Zona Norte')->firstOrFail();
        $response = $this->getJson('/api/zone?page=1&itemsPerPage=10&search=Departamento%20Padre');
        $response
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.department_name', 'Departamento Padre');

        $encryptedId = $response->json('data.0.id');
        $encryptedDepartmentId = $response->json('data.0.department_id');
        $this->assertSame((string) $zone->id, Crypt::decrypt($encryptedId));
        $this->assertSame((string) $department->id, Crypt::decrypt($encryptedDepartmentId));

        $this->putJson("/api/zone/{$encryptedId}", [
            'name' => 'Zona Actualizada',
            'department_id' => $this->encryptId($otherDepartment->id),
        ])->assertOk();

        $this->assertDatabaseHas('zone', [
            'id' => $zone->id,
            'name' => 'Zona Actualizada',
            'department_id' => $otherDepartment->id,
        ]);

        $this->deleteJson("/api/zone/{$encryptedId}")->assertOk();
        $this->assertSoftDeleted('zone', ['id' => $zone->id]);

        $this->postJson('/api/zone', [
            'name' => 'Zona inválida',
            'department_id' => $this->encryptId(999999),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['department_id']);
    }

    public function test_zone_seeder_is_idempotent_and_restores_soft_deleted_rows(): void
    {
        $department = $this->department('90', 'Departamento de prueba');

        $this->seed(ZoneSeeder::class);
        $this->seed(ZoneSeeder::class);

        $this->assertSame(3, Zone::where('department_id', $department->id)->count());

        $zone = Zone::where('name', 'Zona Norte')->firstOrFail();
        $zone->delete();

        $this->seed(ZoneSeeder::class);

        $this->assertNotNull(Zone::find($zone->id));
        $this->assertSame(3, Zone::where('department_id', $department->id)->count());
    }

    private function department(string $code, string $name): Department
    {
        return Department::create([
            'department_name' => $name,
            'min_dpto' => $name,
            'may_dpto' => mb_strtoupper($name),
            'cod_dpto' => $code,
        ]);
    }

    private function encryptId(int $id): string
    {
        return Crypt::encrypt((string) $id);
    }
}
