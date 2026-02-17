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
        'created_by',
    ];

    protected $casts = [
        'done' => 'boolean',
    ];

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
