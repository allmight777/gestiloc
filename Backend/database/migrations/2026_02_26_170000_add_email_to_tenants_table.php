<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Vérifier quelles colonnes existent déjà
        $existingColumns = DB::getSchemaBuilder()->getColumnListing('tenants');
        
        Schema::table('tenants', function (Blueprint $table) use ($existingColumns) {
            // Email du locataire
            if (!in_array('email', $existingColumns)) {
                $table->string('email')->nullable()->after('last_name');
            }
            
            // Contact
            if (!in_array('phone', $existingColumns)) {
                $table->string('phone')->nullable()->after('email');
            }
            
            // Dates et lieu de naissance
            if (!in_array('birth_date', $existingColumns)) {
                $table->date('birth_date')->nullable()->after('phone');
            }
            if (!in_array('birth_place', $existingColumns)) {
                $table->string('birth_place')->nullable()->after('birth_date');
            }
            
            // Situation personnelle
            if (!in_array('marital_status', $existingColumns)) {
                $table->string('marital_status')->nullable()->after('birth_place');
            }
            if (!in_array('tenant_type', $existingColumns)) {
                $table->string('tenant_type')->nullable()->after('marital_status');
            }
            
            // Situation professionnelle
            if (!in_array('profession', $existingColumns)) {
                $table->string('profession')->nullable()->after('tenant_type');
            }
            if (!in_array('employer', $existingColumns)) {
                $table->string('employer')->nullable()->after('profession');
            }
            if (!in_array('contract_type', $existingColumns)) {
                $table->string('contract_type')->nullable()->after('employer');
            }
            if (!in_array('monthly_income', $existingColumns)) {
                $table->decimal('monthly_income', 12, 2)->nullable()->after('contract_type');
            }
            if (!in_array('annual_income', $existingColumns)) {
                $table->decimal('annual_income', 12, 2)->nullable()->after('monthly_income');
            }
            
            // Adresse
            if (!in_array('address', $existingColumns)) {
                $table->string('address')->nullable()->after('annual_income');
            }
            if (!in_array('zip_code', $existingColumns)) {
                $table->string('zip_code')->nullable()->after('address');
            }
            if (!in_array('city', $existingColumns)) {
                $table->string('city')->nullable()->after('zip_code');
            }
            if (!in_array('country', $existingColumns)) {
                $table->string('country')->nullable()->after('city');
            }
            
            // Contact d'urgence
            if (!in_array('emergency_contact_name', $existingColumns)) {
                $table->string('emergency_contact_name')->nullable()->after('country');
            }
            if (!in_array('emergency_contact_phone', $existingColumns)) {
                $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
            }
            if (!in_array('emergency_contact_email', $existingColumns)) {
                $table->string('emergency_contact_email')->nullable()->after('emergency_contact_phone');
            }
            
            // Notes
            if (!in_array('notes', $existingColumns)) {
                $table->text('notes')->nullable()->after('emergency_contact_email');
            }
            
            // Garant
            if (!in_array('guarantor_name', $existingColumns)) {
                $table->string('guarantor_name')->nullable()->after('notes');
            }
            if (!in_array('guarantor_phone', $existingColumns)) {
                $table->string('guarantor_phone')->nullable()->after('guarantor_name');
            }
            if (!in_array('guarantor_email', $existingColumns)) {
                $table->string('guarantor_email')->nullable()->after('guarantor_phone');
            }
            if (!in_array('guarantor_profession', $existingColumns)) {
                $table->string('guarantor_profession')->nullable()->after('guarantor_email');
            }
            if (!in_array('guarantor_income', $existingColumns)) {
                $table->decimal('guarantor_income', 12, 2)->nullable()->after('guarantor_profession');
            }
            if (!in_array('guarantor_monthly_income', $existingColumns)) {
                $table->decimal('guarantor_monthly_income', 12, 2)->nullable()->after('guarantor_income');
            }
            if (!in_array('guarantor_address', $existingColumns)) {
                $table->string('guarantor_address')->nullable()->after('guarantor_monthly_income');
            }
            if (!in_array('guarantor_birth_date', $existingColumns)) {
                $table->date('guarantor_birth_date')->nullable()->after('guarantor_address');
            }
            if (!in_array('guarantor_birth_place', $existingColumns)) {
                $table->string('guarantor_birth_place')->nullable()->after('guarantor_birth_date');
            }
            
            // Documents
            if (!in_array('document_type', $existingColumns)) {
                $table->string('document_type')->nullable()->after('guarantor_birth_place');
            }
            if (!in_array('document_path', $existingColumns)) {
                $table->string('document_path')->nullable()->after('document_type');
            }
            
            // Score de solvabilité
            if (!in_array('solvency_score', $existingColumns)) {
                $table->decimal('solvency_score', 5, 2)->nullable()->after('document_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'email',
                'phone',
                'birth_date',
                'birth_place',
                'marital_status',
                'tenant_type',
                'profession',
                'employer',
                'contract_type',
                'monthly_income',
                'annual_income',
                'address',
                'zip_code',
                'city',
                'country',
                'emergency_contact_name',
                'emergency_contact_phone',
                'emergency_contact_email',
                'notes',
                'guarantor_name',
                'guarantor_phone',
                'guarantor_email',
                'guarantor_profession',
                'guarantor_income',
                'guarantor_monthly_income',
                'guarantor_address',
                'guarantor_birth_date',
                'guarantor_birth_place',
                'document_type',
                'document_path',
                'solvency_score',
            ]);
        });
    }
};
