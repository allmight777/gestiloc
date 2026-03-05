<?php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => [
        'https://gestiloc-frontend.vercel.app',
        'http://localhost:8080',
        'http://localhost:8081',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:8081',
    ],
    'allowed_origins_patterns' => [
        '#^https://gestiloc-frontend.*\.vercel\.app$#',
    ],
    'allowed_headers' => [
        'Content-Type',
        'X-Auth-Token',
        'Origin',
        'Authorization',
        'X-CSRF-TOKEN',
        'X-Requested-With',
        'Accept',
        'X-XSRF-TOKEN',
    ],
    'exposed_headers' => [
        'Authorization',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
    ],
    'max_age' => 60 * 60 * 24,
    'supports_credentials' => true,
];
