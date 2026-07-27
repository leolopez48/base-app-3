<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Zone;
use Illuminate\Database\Seeder;

class ZoneSeeder extends Seeder
{
    public function run(): void
    {
        Department::query()->each(function (Department $department) {
            foreach (['Zona Norte', 'Zona Centro', 'Zona Sur'] as $name) {
                Zone::withTrashed()->updateOrCreate(
                    [
                        'name' => $name,
                        'department_id' => $department->id,
                    ],
                    ['deleted_at' => null]
                );
            }
        });
    }
}
