<?php

return [
    'env' => env('FEDAPAY_ENV', 'sandbox'),
    'api_key' => env('FEDAPAY_API_KEY'),           // ✅ secret
    'public_key' => env('FEDAPAY_PUBLIC_KEY'),     // ✅ public
    'webhook_secret' => env('FEDAPAY_WEBHOOK_SECRET'), // ✅ webhook signing secret (différent !)
    'currency' => env('FEDAPAY_CURRENCY', 'XOF'),
    'commission_rate' => (float) env('FEDAPAY_COMMISSION_RATE', 0.05),
];
