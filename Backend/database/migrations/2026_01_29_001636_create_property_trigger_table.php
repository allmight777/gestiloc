<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_user_audit', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('property_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->unsignedBigInteger('lease_id')->nullable();
            $table->string('action');
            $table->string('role')->nullable();
            $table->decimal('share_percentage', 5, 2)->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('old_status')->nullable();
            $table->string('new_status')->nullable();
            $table->text('changes')->nullable();
            $table->unsignedBigInteger('performed_by')->nullable();
            $table->string('performed_by_role');
            $table->timestamps();

            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('lease_id')->references('id')->on('leases')->onDelete('cascade');
            $table->foreign('performed_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['property_id', 'user_id']);
            $table->index('action');
            $table->index('created_at');
        });

        // ✅ PostgreSQL : fonction + triggers (remplace la syntaxe MySQL)
        DB::unprepared('
            CREATE OR REPLACE FUNCTION fn_property_user_audit()
            RETURNS TRIGGER AS $$
            DECLARE
                landlord_id_val BIGINT;
                v_action TEXT;
                v_old_status TEXT;
                v_new_status TEXT;
                v_changes TEXT;
                v_property_id BIGINT;
                v_user_id BIGINT;
                v_tenant_id BIGINT;
                v_lease_id BIGINT;
                v_role TEXT;
                v_share DECIMAL;
                v_start DATE;
                v_end DATE;
            BEGIN
                IF TG_OP = \'DELETE\' THEN
                    v_property_id := OLD.property_id;
                    v_user_id     := OLD.user_id;
                    v_tenant_id   := OLD.tenant_id;
                    v_lease_id    := OLD.lease_id;
                    v_action      := \'terminated\';
                    v_old_status  := OLD.status;
                    v_new_status  := NULL;
                    v_role        := OLD.role;
                    v_share       := OLD.share_percentage;
                    v_start       := OLD.start_date;
                    v_end         := OLD.end_date;
                    v_changes     := NULL;
                ELSIF TG_OP = \'INSERT\' THEN
                    v_property_id := NEW.property_id;
                    v_user_id     := NEW.user_id;
                    v_tenant_id   := NEW.tenant_id;
                    v_lease_id    := NEW.lease_id;
                    v_action      := \'assigned\';
                    v_old_status  := NULL;
                    v_new_status  := NEW.status;
                    v_role        := NEW.role;
                    v_share       := NEW.share_percentage;
                    v_start       := NEW.start_date;
                    v_end         := NEW.end_date;
                    v_changes     := NULL;
                ELSE
                    v_property_id := NEW.property_id;
                    v_user_id     := NEW.user_id;
                    v_tenant_id   := NEW.tenant_id;
                    v_lease_id    := NEW.lease_id;
                    v_action      := \'updated\';
                    v_old_status  := OLD.status;
                    v_new_status  := NEW.status;
                    v_role        := NEW.role;
                    v_share       := NEW.share_percentage;
                    v_start       := NEW.start_date;
                    v_end         := NEW.end_date;
                    v_changes     := json_build_object(
                        \'status\', json_build_object(\'old\', OLD.status, \'new\', NEW.status),
                        \'end_date\', json_build_object(\'old\', OLD.end_date, \'new\', NEW.end_date),
                        \'role\', json_build_object(\'old\', OLD.role, \'new\', NEW.role)
                    )::text;
                END IF;

                SELECT landlord_id INTO landlord_id_val FROM properties WHERE id = v_property_id;

                INSERT INTO property_user_audit (
                    property_id, user_id, tenant_id, lease_id, action, role,
                    share_percentage, start_date, end_date, old_status, new_status,
                    changes, performed_by, performed_by_role, created_at, updated_at
                ) VALUES (
                    v_property_id, v_user_id, v_tenant_id, v_lease_id,
                    v_action, v_role, v_share, v_start, v_end,
                    v_old_status, v_new_status, v_changes,
                    landlord_id_val, \'system\', NOW(), NOW()
                );

                IF TG_OP = \'DELETE\' THEN RETURN OLD; END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        ');

        DB::unprepared('DROP TRIGGER IF EXISTS property_user_ai ON property_user');
        DB::unprepared('DROP TRIGGER IF EXISTS property_user_au ON property_user');
        DB::unprepared('DROP TRIGGER IF EXISTS property_user_ad ON property_user');

        DB::unprepared('
            CREATE TRIGGER property_user_ai
            AFTER INSERT ON property_user
            FOR EACH ROW EXECUTE FUNCTION fn_property_user_audit()
        ');

        DB::unprepared('
            CREATE TRIGGER property_user_au
            AFTER UPDATE ON property_user
            FOR EACH ROW EXECUTE FUNCTION fn_property_user_audit()
        ');

        DB::unprepared('
            CREATE TRIGGER property_user_ad
            AFTER DELETE ON property_user
            FOR EACH ROW EXECUTE FUNCTION fn_property_user_audit()
        ');
    }

    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS property_user_ai ON property_user');
        DB::unprepared('DROP TRIGGER IF EXISTS property_user_au ON property_user');
        DB::unprepared('DROP TRIGGER IF EXISTS property_user_ad ON property_user');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_property_user_audit()');
        Schema::dropIfExists('property_user_audit');
    }
};
