<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
{
    Schema::table('landlords', function (Blueprint $table) {
        $table->boolean('is_professional')->default(false)->after('user_id');
        $table->string('id_type', 50)->nullable()->after('is_professional');
        $table->string('id_number', 100)->nullable()->after('id_type');
        $table->string('address', 500)->nullable()->after('id_number');

        $table->string('ifu', 50)->nullable()->after('vat_number');
        $table->string('rccm', 50)->nullable()->after('ifu');
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('landlords', function (Blueprint $table) {
            //
        });
    }
};
