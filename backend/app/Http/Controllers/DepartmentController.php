<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Encrypt;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        [$page, $itemsPerPage, $skip] = $this->pagination($request);
        [$sortBy, $sort] = $this->sorting($request);
        $search = '%' . $request->input('search', '') . '%';

        if ($itemsPerPage === -1) {
            $itemsPerPage = Department::count();
            $skip = 0;
        }

        $departments = Department::allDataSearched(
            $search,
            $sortBy,
            $sort,
            $skip,
            $itemsPerPage
        );

        return response()->json([
            'message' => 'Registros obtenidos correctamente.',
            'data' => Encrypt::encryptObject($departments, 'id'),
            'total' => Department::counterPagination($search),
        ]);
    }

    public function store(Request $request)
    {
        Department::create($this->validatedData($request));

        return response()->json([
            'message' => 'Registro creado correctamente.',
        ]);
    }

    public function show($id)
    {
        $department = Department::findOrFail(Encrypt::decryptValue($id));

        return response()->json([
            'message' => 'Registro obtenido correctamente.',
            'data' => Encrypt::encryptValueObject($department, 'id'),
        ]);
    }

    public function update(Request $request, $id)
    {
        $department = Department::findOrFail(Encrypt::decryptValue($id));
        $department->update($this->validatedData($request));

        return response()->json([
            'message' => 'Registro modificado correctamente.',
        ]);
    }

    public function destroy($id)
    {
        Department::findOrFail(Encrypt::decryptValue($id))->delete();

        return response()->json([
            'message' => 'Registro eliminado correctamente.',
        ]);
    }

    private function validatedData(Request $request): array
    {
        return $request->validate([
            'department_name' => ['required', 'string', 'max:255'],
            'min_dpto' => ['required', 'string', 'max:255'],
            'may_dpto' => ['required', 'string', 'max:255'],
            'cod_dpto' => ['required', 'string', 'max:255'],
        ]);
    }

    private function pagination(Request $request): array
    {
        $page = max((int) $request->input('page', 1), 1);
        $itemsPerPage = (int) $request->input('itemsPerPage', 10);

        return [$page, $itemsPerPage, ($page - 1) * max($itemsPerPage, 0)];
    }

    private function sorting(Request $request): array
    {
        $sortItem = $request->input('sortBy.0');

        return [
            is_array($sortItem) ? ($sortItem['key'] ?? 'id') : ($sortItem ?? 'id'),
            is_array($sortItem)
                ? ($sortItem['order'] ?? 'desc')
                : ($request->has('sortDesc.0') ? 'asc' : 'desc'),
        ];
    }
}
