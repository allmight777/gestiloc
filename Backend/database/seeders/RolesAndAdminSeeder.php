<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Landlord;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RolesAndAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles
        $admin     = Role::firstOrCreate(['name' => 'admin']);
        $landlord  = Role::firstOrCreate(['name' => 'landlord']);
        $tenant    = Role::firstOrCreate(['name' => 'tenant']);

        // Create dev admin
        $user = User::firstOrCreate(
            ['email' => 'admin@dev.com'],
            [
                'password' => Hash::make('password'),
                'phone'    => '0000000000',
            ]
        );

        if (! $user->hasRole('admin')) {
            $user->assignRole('admin');
        }

        // Create dev landlord
        $landlordUser = User::firstOrCreate(
            ['email' => 'proprietaire@dev.com'],
            [
                'password' => Hash::make('password'),
                'phone'    => '+22912345678',
            ]
        );

        if (! $landlordUser->hasRole('landlord')) {
            $landlordUser->assignRole('landlord');
        }

        // Create landlord profile
        Landlord::firstOrCreate(
            ['user_id' => $landlordUser->id],
            [
                'first_name' => 'Jean',
                'last_name' => 'Dupont',
                'company_name' => 'Gestion Immobilière Dupont',
                'address_billing' => '123 Rue du Commerce, Cotonou, Bénin',
                'is_professional' => true,
                'ifu' => '3201234567890',
                'rccm' => 'BJ-COT-2023-A1234',
                'vat_number' => 'BJ123456789',
            ]
        );

        // Create dev tenant
        $tenantUser = User::firstOrCreate(
            ['email' => 'locataire@dev.com'],
            [
                'password' => Hash::make('password'),
                'phone'    => '+22998765432',
            ]
        );

        if (! $tenantUser->hasRole('tenant')) {
            $tenantUser->assignRole('tenant');
        }

        // Create tenant profile
        Tenant::firstOrCreate(
            ['user_id' => $tenantUser->id],
            [
                'first_name' => 'Marie',
                'last_name' => 'Kouadio',
                'status' => 'active',
                'solvency_score' => 850.00,
            ]
        );
    }
}