<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
          if (!Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')
                      ->default(true)
                      ->after('remember_token');
            }


            if (!Schema::hasColumn('users', 'account_deactivated_at')) {
                $table->timestamp('account_deactivated_at')
                      ->nullable()
                      ->after('is_active');
            }


            if (!Schema::hasColumn('users', 'deactivated_by')) {
                $table->foreignId('deactivated_by')
                      ->nullable()
                      ->after('account_deactivated_at')
                      ->constrained('users')
                      ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'deactivated_by')) {
                try {
                    $table->dropForeign(['deactivated_by']);
                } catch (\Throwable $e) {
                    // ignore if foreign key does not exist
                }
            }

            $columnsToDrop = [];
            if (Schema::hasColumn('users', 'is_active')) {
                $columnsToDrop[] = 'is_active';
            }
            if (Schema::hasColumn('users', 'account_deactivated_at')) {
                $columnsToDrop[] = 'account_deactivated_at';
            }
            if (Schema::hasColumn('users', 'deactivated_by')) {
                $columnsToDrop[] = 'deactivated_by';
            }

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
