<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
class AuthenticateWithToken
{
    public function handle(Request $request, Closure $next)
    {
        // 1. Déjà authentifié par session
        if (auth()->check()) {
            return $next($request);
        }

        // 2. Token dans l'URL
        if ($request->has('api_token')) {
            $token = PersonalAccessToken::findToken($request->api_token);
            if ($token) {
                auth()->login($token->tokenable);
                session(['api_token' => $request->api_token]);
                return $next($request);
            }
        }

        // 3. Token en session (survit aux redirections POST->GET)
        if (session('api_token')) {
            $token = PersonalAccessToken::findToken(session('api_token'));
            if ($token) {
                auth()->login($token->tokenable);
                return $next($request);
            }
        }

        // 4. Bearer token
        if ($request->bearerToken()) {
            $token = PersonalAccessToken::findToken($request->bearerToken());
            if ($token) {
                auth()->login($token->tokenable);
                return $next($request);
            }
        }

        return redirect()->route('login');
    }
}
