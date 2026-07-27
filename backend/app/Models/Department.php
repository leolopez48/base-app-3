<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'department';

    protected $fillable = [
        'department_name',
        'min_dpto',
        'may_dpto',
        'cod_dpto',
    ];

    public $hidden = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public $timestamps = true;

    public static function allDataSearched($search, $sortBy, $sort, $skip, $itemsPerPage)
    {
        $allowedSorts = [
            'id' => 'department.id',
            'department_name' => 'department.department_name',
            'min_dpto' => 'department.min_dpto',
            'may_dpto' => 'department.may_dpto',
            'cod_dpto' => 'department.cod_dpto',
        ];
        $sortColumn = $allowedSorts[$sortBy] ?? $allowedSorts['id'];
        $sortDirection = strtolower($sort) === 'asc' ? 'asc' : 'desc';

        return Department::query()
            ->select('department.*', 'department.id as id')
            ->where(function ($query) use ($search) {
                $query->where('department.department_name', 'like', $search)
                    ->orWhere('department.min_dpto', 'like', $search)
                    ->orWhere('department.may_dpto', 'like', $search)
                    ->orWhere('department.cod_dpto', 'like', $search);
            })
            ->skip($skip)
            ->take($itemsPerPage)
            ->orderBy($sortColumn, $sortDirection)
            ->get();
    }

    public static function counterPagination($search)
    {
        return Department::query()
            ->where(function ($query) use ($search) {
                $query->where('department.department_name', 'like', $search)
                    ->orWhere('department.min_dpto', 'like', $search)
                    ->orWhere('department.may_dpto', 'like', $search)
                    ->orWhere('department.cod_dpto', 'like', $search);
            })
            ->count();
    }

    public function municipalities()
    {
        return $this->hasMany(Municipality::class, 'department_id');
    }

    public function zones()
    {
        return $this->hasMany(Zone::class, 'department_id');
    }
}
