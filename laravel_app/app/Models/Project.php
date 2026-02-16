<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'color', 'icon', 'key'];

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }
}
