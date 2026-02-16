<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'text',
        'days',
        'done',
        'start_time',
        'end_time',
        'priority',
        'progress',
    ];

    protected $casts = [
        'done' => 'boolean',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
