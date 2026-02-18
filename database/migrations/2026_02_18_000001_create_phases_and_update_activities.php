<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // 1. Create phases table
        Schema::create('phases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });

        // 2. Add new columns to activities
        Schema::table('activities', function (Blueprint $table) {
            $table->foreignId('phase_id')->nullable()->after('project_id');
            $table->text('description')->nullable()->after('text');
            $table->text('achievements')->nullable()->after('progress');
        });

        // 3. Make justification nullable in activity_logs
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->text('justification')->nullable()->change();
        });

        // 4. Migrate existing data: create a default phase per project and assign activities
        $projects = DB::table('projects')->get();
        foreach ($projects as $project) {
            $phaseId = DB::table('phases')->insertGetId([
                'project_id' => $project->id,
                'name' => 'Fase Inicial',
                'description' => 'Fase generada automáticamente con las actividades existentes.',
                'order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Assign all existing activities of this project to the default phase
            DB::table('activities')
                ->where('project_id', $project->id)
                ->whereNull('phase_id')
                ->update(['phase_id' => $phaseId]);
        }

        // 5. Now add the FK constraint (after data is populated)
        Schema::table('activities', function (Blueprint $table) {
            $table->foreign('phase_id')->references('id')->on('phases')->cascadeOnDelete();
        });
    }

    public function down()
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropForeign(['phase_id']);
            $table->dropColumn(['phase_id', 'description', 'achievements']);
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->text('justification')->nullable(false)->change();
        });

        Schema::dropIfExists('phases');
    }
};
