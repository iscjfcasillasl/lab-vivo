<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'phase_id',
        'project_id',
        'text',
        'description',
        'days',
        'done',
        'start_time',
        'end_time',
        'priority',
        'progress',
        'achievements',
        'created_by',
    ];

    protected $casts = [
        'done' => 'boolean',
    ];

    public function phase()
    {
        return $this->belongsTo(Phase::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function logs()
    {
        return $this->hasMany(ActivityLog::class)->orderBy('created_at', 'desc');
    }
}
