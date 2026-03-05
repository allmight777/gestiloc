<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
return new class extends Migration {
    public function up(): void
    {
        // PostgreSQL : pas d'ENUM natif, on utilise une contrainte CHECK
        DB::statement("ALTER TABLE leases ALTER COLUMN type SET DEFAULT 'nu'");
        DB::statement("ALTER TABLE leases DROP CONSTRAINT IF EXISTS leases_type_check");
        DB::statement("ALTER TABLE leases ADD CONSTRAINT leases_type_check CHECK (type IN ('nu', 'meuble'))");
    }
    public function down(): void
    {
        DB::statement("ALTER TABLE leases DROP CONSTRAINT IF EXISTS leases_type_check");
    }
};
