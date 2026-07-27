<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Municipality extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'municipality';

    protected $fillable = [
        'name',
        'department_id',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public $timestamps = true;

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public static function allDataSearched($search, $sortBy, $sort, $skip, $itemsPerPage)
    {
        $allowedSorts = [
            'id' => 'municipality.id',
            'name' => 'municipality.name',
            'department_name' => 'department.department_name',
        ];
        $sortColumn = $allowedSorts[$sortBy] ?? $allowedSorts['id'];
        $sortDirection = strtolower($sort) === 'asc' ? 'asc' : 'desc';

        return Municipality::select(
                'municipality.*',
                'municipality.id as id',
                'department.department_name as department_name'
            )
            ->leftJoin('department', 'municipality.department_id', '=', 'department.id')
            ->where(function ($q) use ($search) {
                $q->where('municipality.name', 'like', $search)
                  ->orWhere('department.department_name', 'like', $search)
                  ->orWhere('department.cod_dpto', 'like', $search);
            })
            ->skip($skip)
            ->take($itemsPerPage)
            ->orderBy($sortColumn, $sortDirection)
            ->get();
    }

    public static function counterPagination($search)
    {
        return Municipality::select('municipality.*', 'municipality.id as id')
            ->leftJoin('department', 'municipality.department_id', '=', 'department.id')
            ->where(function ($q) use ($search) {
                $q->where('municipality.name', 'like', $search)
                  ->orWhere('department.department_name', 'like', $search)
                  ->orWhere('department.cod_dpto', 'like', $search);
            })
            ->count();
    }
}
