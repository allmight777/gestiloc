<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Property;
use App\Models\Lease;
use App\Policies\LeasePolicy;
use App\Policies\PropertyPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
          Property::class => PropertyPolicy::class,
        Lease::class => LeasePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        //
    }
}
