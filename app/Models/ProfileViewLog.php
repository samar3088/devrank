<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfileViewLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'company_id',
        'candidate_id',
        'interest_request_id',
        'view_type',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function company()
    {
        return $this->belongsTo(User::class, 'company_id');
    }

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }

    public function interestRequest()
    {
        return $this->belongsTo(InterestRequest::class);
    }
}