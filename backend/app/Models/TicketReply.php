<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketReply extends Model
{
    protected $fillable = [
        'ticket_id',
        'user_id',
        'is_admin',
        'message',
    ];

    protected $casts = [
        'is_admin' => 'boolean',
    ];

    /**
     * Get the ticket this reply belongs to
     */
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    /**
     * Get the user who wrote the reply
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
