<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyRequest;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    /**
     * GET /api/properties
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return response()->json(
                Property::latest()->paginate(20)
            );
        }

        if ($user->isLandlord()) {
            $landlord = $user->landlord;

            if (! $landlord) {
                return response()->json([
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ]);
            }

            return response()->json(
                $landlord->properties()->latest()->paginate(20)
            );
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }

    /**
     * POST /api/properties
     */
    public function store(StorePropertyRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $landlord = $user->landlord;
        if (! $landlord) {
            return response()->json(['message' => 'Landlord profile missing'], 422);
        }

        $data = $request->validated();

        // Sécurité serveur
        $data['landlord_id'] = $landlord->id;
        $data['user_id'] = $user->id;

        $property = Property::create($data);

        return response()->json($property, 201);
    }

    /**
     * GET /api/properties/{id}
     */
    public function show(Request $request, $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $user = $request->user();

        if ($user->isAdmin()) {
            return response()->json($property);
        }

        if ($user->isLandlord()) {
            if (! $user->landlord || $property->landlord_id !== $user->landlord->id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            return response()->json($property);
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }

    /**
     * PUT /api/properties/{id}
     */
    public function update(StorePropertyRequest $request, $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $user = $request->user();

        if (! $user->isAdmin()) {
            if (! $user->isLandlord()) {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            if (! $user->landlord || $property->landlord_id !== $user->landlord->id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        $data = $request->validated();

        // 🔒 Protection anti-mass assignment
        unset($data['landlord_id'], $data['user_id']);

        $property->update($data);

        return response()->json($property->fresh());
    }

    /**
     * DELETE /api/properties/{id}
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $user = $request->user();

        if (! $user->isAdmin()) {
            if (! $user->isLandlord()) {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            if (! $user->landlord || $property->landlord_id !== $user->landlord->id) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        $property->delete();

        return response()->json(['message' => 'Property deleted']);
    }
}
