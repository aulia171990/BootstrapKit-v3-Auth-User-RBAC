<?php

namespace App\Models\Chat;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MessageAttachment extends Model
{
    use HasUuids;

    protected $fillable = ['message_id', 'type', 'url', 'mime_type', 'size', 'metadata', 'processed_at'];

    protected $casts = [
        'size' => 'integer',
        'metadata' => 'array',
        'processed_at' => 'datetime',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }
}
