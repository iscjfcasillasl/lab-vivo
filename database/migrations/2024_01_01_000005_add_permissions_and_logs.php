<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Add role to users (superadmin, user)
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user')->after('avatar');
        });

        // Add created_by_user_id to activities to track ownership
        Schema::table('activities', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->after('progress')->constrained('users')->nullOnDelete();
        });

        // Create activity_logs table for progress justifications
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('action'); // 'progress_update', 'created', 'edited', 'deleted'
            $table->tinyInteger('old_progress')->nullable();
            $table->tinyInteger('new_progress')->nullable();
            $table->text('justification'); // Required description/justification
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('activity_logs');

        Schema::table('activities', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn('created_by');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
