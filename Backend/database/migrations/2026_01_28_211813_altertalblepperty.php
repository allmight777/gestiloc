<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
return new class extends Migration {
    public function up(): void
    {
        // Mettre à jour la contrainte CHECK pour le status
        DB::statement("ALTER TABLE property_modification_audits DROP CONSTRAINT IF EXISTS property_modification_audits_status_check");
        DB::statement("ALTER TABLE property_modification_audits ADD CONSTRAINT property_modification_audits_status_check CHECK (status IN ('modified', 'pending_approval', 'approved', 'rejected'))");
        DB::statement("ALTER TABLE property_modification_audits ALTER COLUMN status SET DEFAULT 'modified'");

        // Ajouter notification_sent_at si elle n'existe pas
        if (!Schema::hasColumn('property_modification_audits', 'notification_sent_at')) {
            Schema::table('property_modification_audits', function (Blueprint $table) {
                $table->timestamp('notification_sent_at')->nullable();
            });
        }

        // Mettre à jour les anciens statuts
        DB::table('property_modification_audits')
            ->where('status', 'pending_approval')
            ->update(['status' => 'modified']);
    }
    public function down(): void
    {
        Schema::table('property_modification_audits', function (Blueprint $table) {
            if (Schema::hasColumn('property_modification_audits', 'notification_sent_at')) {
                $table->dropColumn('notification_sent_at');
            }
        });
        DB::statement("ALTER TABLE property_modification_audits DROP CONSTRAINT IF EXISTS property_modification_audits_status_check");
        DB::statement("ALTER TABLE property_modification_audits ADD CONSTRAINT property_modification_audits_status_check CHECK (status IN ('pending_approval', 'approved', 'rejected'))");
    }
};
