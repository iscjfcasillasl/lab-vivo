<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable(); // description was in array, now distinct
            $table->string('color')->default('#000000');
            $table->string('icon')->nullable();
            $table->string('key')->unique(); // Legacy key for URL/identification? Or just use ID? Let's keep key for compatibility or just drop it. ID is better. But user wants migration. I'll add 'key' just in case.
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('projects');
    }
};
