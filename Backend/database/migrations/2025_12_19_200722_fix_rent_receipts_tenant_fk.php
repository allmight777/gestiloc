<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('rent_receipts', function (Blueprint $table) {
            // drop l'ancien FK vers users
            $table->dropForeign(['tenant_id']);
        });

        Schema::table('rent_receipts', function (Blueprint $table) {
            // recrée vers tenants
            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('rent_receipts', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
        });

        Schema::table('rent_receipts', function (Blueprint $table) {
            $table->foreign('tenant_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }
};
