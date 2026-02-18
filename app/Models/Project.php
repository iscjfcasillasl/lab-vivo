<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'color', 'icon', 'key'];

    public function phases()
    {
        return $this->hasMany(Phase::class)->orderBy('order');
    }

    /**
     * Direct access to all activities via HasManyThrough (Project -> Phase -> Activity)
     */
    public function activities(): HasManyThrough
    {
        return $this->hasManyThrough(Activity::class, Phase::class);
    }
}
