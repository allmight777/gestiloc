<?php

return [
    'env' => env('FEDAPAY_ENV', 'sandbox'),
    'api_key' => env('FEDAPAY_API_KEY'),
    'public_key' => env('FEDAPAY_PUBLIC_KEY'),
    'webhook_secret' => env('FEDAPAY_WEBHOOK_SECRET'),

    'currency' => env('FEDAPAY_CURRENCY', 'XOF'),
    'commission_rate' => (float) env('FEDAPAY_COMMISSION_RATE', 0.05),

    'front_url' => env('FRONT_URL', 'http://localhost:8080'),
];
