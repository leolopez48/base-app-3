<?php

namespace App\Http\Controllers;

use App\Models\Zone;
use Encrypt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ZoneController extends Controller
{
    public function index(Request $request)
    {
        $page = max((int) $request->input('page', 1), 1);
        $itemsPerPage = (int) $request->input('itemsPerPage', 10);
        $skip = ($page - 1) * max($itemsPerPage, 0);

        if ($itemsPerPage === -1) {
            $itemsPerPage = Zone::count();
            $skip = 0;
        }

        $sortItem = $request->input('sortBy.0');
        $sortBy = is_array($sortItem)
            ? ($sortItem['key'] ?? 'id')
            : ($sortItem ?? 'id');
        $sort = is_array($sortItem)
            ? ($sortItem['order'] ?? 'desc')
            : ($request->has('sortDesc.0') ? 'asc' : 'desc');
        $search = '%' . $request->input('search', '') . '%';

        $zones = Zone::allDataSearched(
            $search,
            $sortBy,
            $sort,
            $skip,
            $itemsPerPage
        );
        $zones = Encrypt::encryptObject($zones, 'id', 'department_id');

        return response()->json([
            'message' => 'Registros obtenidos correctamente.',
            'data' => $zones,
            'total' => Zone::counterPagination($search),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request);

        Zone::create($data);

        return response()->json([
            'message' => 'Registro creado correctamente.',
        ]);
    }

    public function show($id)
    {
        $zone = Zone::query()
            ->select(
                'zone.*',
                'department.department_name as department_name'
            )
            ->leftJoin('department', 'zone.department_id', '=', 'department.id')
            ->findOrFail(Encrypt::decryptValue($id));

        return response()->json([
            'message' => 'Registro obtenido correctamente.',
            'data' => Encrypt::encryptValueObject($zone, 'id', 'department_id'),
        ]);
    }

    public function update(Request $request, $id)
    {
        $zone = Zone::findOrFail(Encrypt::decryptValue($id));
        $zone->update($this->validatedData($request));

        return response()->json([
            'message' => 'Registro modificado correctamente.',
        ]);
    }

    public function destroy($id)
    {
        Zone::findOrFail(Encrypt::decryptValue($id))->delete();

        return response()->json([
            'message' => 'Registro eliminado correctamente.',
        ]);
    }

    private function validatedData(Request $request): array
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'department_id' => ['required', 'string'],
        ]);
        $validator->validate();

        $departmentId = Encrypt::decryptValue($request->input('department_id'));

        Validator::make(
            ['department_id' => $departmentId],
            ['department_id' => ['required', 'integer', 'exists:department,id']]
        )->validate();

        return [
            'name' => $request->input('name'),
            'department_id' => $departmentId,
        ];
    }
}
