<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Vérifier si l'utilisateur est authentifié
        if (!auth()->check()) {
            return $next($request);
        }

        $user = auth()->user();

        // Vérifier le statut de l'utilisateur
        if ($user->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Votre compte a été ' . ($user->status === 'suspended' ? 'suspendu' : 'désactivé'),
                'code' => 'account_' . $user->status,
            ], 403);
        }

        return $next($request);
    }
}
