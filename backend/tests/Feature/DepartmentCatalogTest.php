<?php

namespace Tests\Feature;

use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Tests\TestCase;

class DepartmentCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_department_api_validates_and_performs_the_crud_with_encrypted_ids(): void
    {
        $this->postJson('/api/department', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'department_name',
                'min_dpto',
                'may_dpto',
                'cod_dpto',
            ]);

        $payload = [
            'department_name' => 'Departamento Norte',
            'min_dpto' => 'Departamento Norte',
            'may_dpto' => 'DEPARTAMENTO NORTE',
            'cod_dpto' => '90',
        ];

        $this->postJson('/api/department', $payload)
            ->assertOk()
            ->assertJson(['message' => 'Registro creado correctamente.']);

        $department = Department::where('cod_dpto', '90')->firstOrFail();

        $response = $this->getJson('/api/department?page=1&itemsPerPage=10&search=Norte');
        $response
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.department_name', 'Departamento Norte');

        $encryptedId = $response->json('data.0.id');
        $this->assertNotSame((string) $department->id, $encryptedId);
        $this->assertSame((string) $department->id, Crypt::decrypt($encryptedId));

        $this->putJson("/api/department/{$encryptedId}", [
            ...$payload,
            'department_name' => 'Departamento Actualizado',
        ])->assertOk();

        $this->assertDatabaseHas('department', [
            'id' => $department->id,
            'department_name' => 'Departamento Actualizado',
        ]);

        $this->deleteJson("/api/department/{$encryptedId}")->assertOk();
        $this->assertSoftDeleted('department', ['id' => $department->id]);
    }

    public function test_department_search_and_sort_exclude_soft_deleted_records(): void
    {
        Department::create([
            'department_name' => 'Beta',
            'min_dpto' => 'Beta',
            'may_dpto' => 'BETA',
            'cod_dpto' => '91',
        ]);
        Department::create([
            'department_name' => 'Alpha',
            'min_dpto' => 'Alpha',
            'may_dpto' => 'ALPHA',
            'cod_dpto' => '92',
        ]);
        Department::create([
            'department_name' => 'Alpha eliminado',
            'min_dpto' => 'Alpha eliminado',
            'may_dpto' => 'ALPHA ELIMINADO',
            'cod_dpto' => '93',
        ])->delete();

        $response = $this->getJson(
            '/api/department?page=1&itemsPerPage=10&search=Alpha&sortBy[0][key]=department_name&sortBy[0][order]=asc'
        );

        $response
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.department_name', 'Alpha');
    }
}
