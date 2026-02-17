<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('approved')->default(false)->after('role');
        });

        // Auto-approve the superadmin and any existing users
        DB::table('users')->where('email', 'admin_service@nortenayarit.tecnm.mx')->update(['approved' => true]);
        // Approve all existing users so they aren't locked out
        DB::table('users')->where('approved', false)->update(['approved' => true]);
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('approved');
        });
    }
};
