<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $fillable = [
        'user_id',
        'ticket_number',
        'title',
        'category',
        'priority',
        'status',
        'message',
        'closed_by',
        'closed_at',
    ];

    protected $casts = [
        'closed_at' => 'datetime',
    ];

    /**
     * Get the user who created the ticket
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who closed the ticket
     */
    public function closedBy()
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    /**
     * Get all replies for the ticket
     */
    public function replies()
    {
        return $this->hasMany(TicketReply::class)->orderBy('created_at', 'asc');
    }

    /**
     * Generate unique ticket number
     */
    public static function generateTicketNumber()
    {
        $date = now()->format('Ymd');
        $lastTicket = self::whereDate('created_at', now())->latest('id')->first();
        $sequence = $lastTicket ? (intval(substr($lastTicket->ticket_number, -3)) + 1) : 1;

        return 'TKT-' . $date . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }
}
