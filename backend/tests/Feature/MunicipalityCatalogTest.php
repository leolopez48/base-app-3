<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Municipality;
use Database\Seeders\MunicipalitySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Tests\TestCase;

class MunicipalityCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_municipality_api_validates_relations_and_performs_the_crud(): void
    {
        $department = $this->department('90', 'Departamento Padre');
        $otherDepartment = $this->department('91', 'Departamento Alterno');

        $this->postJson('/api/municipality', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'department_id']);

        $this->postJson('/api/municipality', [
            'name' => 'Municipio de prueba',
            'department_id' => $this->encryptId($department->id),
        ])->assertOk();

        $municipality = Municipality::where('name', 'Municipio de prueba')->firstOrFail();
        $this->assertSame($department->id, $municipality->department->id);
        $this->assertTrue($department->municipalities->contains($municipality));

        $response = $this->getJson(
            '/api/municipality?page=1&itemsPerPage=10&search=Departamento%20Padre'
        );
        $response
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.department_name', 'Departamento Padre');

        $encryptedId = $response->json('data.0.id');
        $encryptedDepartmentId = $response->json('data.0.department_id');
        $this->assertSame((string) $municipality->id, Crypt::decrypt($encryptedId));
        $this->assertSame((string) $department->id, Crypt::decrypt($encryptedDepartmentId));

        $this->putJson("/api/municipality/{$encryptedId}", [
            'name' => 'Municipio actualizado',
            'department_id' => $this->encryptId($otherDepartment->id),
        ])->assertOk();

        $this->assertDatabaseHas('municipality', [
            'id' => $municipality->id,
            'name' => 'Municipio actualizado',
            'department_id' => $otherDepartment->id,
        ]);

        $this->deleteJson("/api/municipality/{$encryptedId}")->assertOk();
        $this->assertSoftDeleted('municipality', ['id' => $municipality->id]);

        $this->postJson('/api/municipality', [
            'name' => 'Municipio inválido',
            'department_id' => $this->encryptId(999999),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['department_id']);
    }

    public function test_municipality_seeder_is_idempotent_and_restores_soft_deleted_rows(): void
    {
        $department = $this->department('01', 'Ahuachapán');

        $this->seed(MunicipalitySeeder::class);
        $this->seed(MunicipalitySeeder::class);

        $this->assertSame(12, Municipality::where('department_id', $department->id)->count());

        $municipality = Municipality::where('name', 'Apaneca')->firstOrFail();
        $municipality->delete();

        $this->seed(MunicipalitySeeder::class);

        $this->assertNotNull(Municipality::find($municipality->id));
        $this->assertSame(12, Municipality::where('department_id', $department->id)->count());
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
