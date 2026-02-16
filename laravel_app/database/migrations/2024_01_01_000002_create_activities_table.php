<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('text'); // 'name' in frontend is called 'text'
            $table->integer('days')->default(1);
            $table->boolean('done')->default(false);
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->enum('priority', ['critical', 'high', 'medium', 'low'])->default('medium'); // As requested
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('activities');
    }
};
