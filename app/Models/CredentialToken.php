<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CredentialToken extends Model
{
    protected $fillable = ['user_id', 'token', 'revoked_at'];

    protected $casts = ['revoked_at' => 'datetime'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->whereNull('revoked_at');
    }

    public function isActive(): bool
    {
        return $this->revoked_at === null;
    }
}
