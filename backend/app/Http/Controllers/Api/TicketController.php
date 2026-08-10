<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TicketController extends Controller
{
    /**
     * Get all tickets for authenticated user
     */
    public function index(Request $request)
    {
        $tickets = Ticket::where('user_id', $request->user()->id)
            ->with(['user:id,name,email', 'replies.user:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tickets);
    }

    /**
     * Create new ticket
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'priority' => ['required', 'in:rendah,sedang,tinggi'],
            'message' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $ticket = Ticket::create([
            'user_id' => $request->user()->id,
            'ticket_number' => Ticket::generateTicketNumber(),
            'title' => $request->title,
            'category' => $request->category,
            'priority' => $request->priority,
            'status' => 'baru',
            'message' => $request->message,
        ]);

        $ticket->load(['user:id,name,email', 'replies']);

        return response()->json($ticket, 201);
    }

    /**
     * Get single ticket detail
     */
    public function show(Request $request, $id)
    {
        $ticket = Ticket::where('user_id', $request->user()->id)
            ->with(['user:id,name,email', 'replies.user:id,name,email', 'closedBy:id,name,email'])
            ->findOrFail($id);

        return response()->json($ticket);
    }

    /**
     * Add reply to ticket
     */
    public function reply(Request $request, $id)
    {
        $ticket = Ticket::where('user_id', $request->user()->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'message' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $reply = TicketReply::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'is_admin' => false,
            'message' => $request->message,
        ]);

        $reply->load('user:id,name,email');

        // Update ticket status to diproses if it was baru
        if ($ticket->status === 'baru') {
            $ticket->update(['status' => 'diproses']);
        }

        return response()->json($reply, 201);
    }
}
