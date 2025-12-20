<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    /**
     * Display a listing of the user's tickets.
     */
    public function index(Request $request)
    {
        $query = auth()->user()->tickets();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by upcoming matches
        if ($request->has('upcoming') && $request->upcoming === 'true') {
            $query->where('match_date', '>=', now());
        }

        // Sort options
        $sortBy = $request->input('sortBy', 'match_date');
        $order = $request->input('order', 'asc');
        $query->orderBy($sortBy, $order);

        // Pagination
        $limit = $request->input('limit', 10);
        $tickets = $query->paginate($limit);

        return response()->json([
            'status' => 'success',
            'data' => $tickets
        ]);
    }

    /**
     * Store a newly created ticket.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'match_title' => 'required|string|max:255',
            'match_date' => 'required|date|after:now',
            'seat_number' => 'nullable|string|max:50',
            'category' => 'required|in:vip,premium,regular,economy',
            'price' => 'required|numeric|min:0',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['status'] = 'pending';

        $ticket = Ticket::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket purchased successfully',
            'data' => $ticket
        ], 201);
    }

    /**
     * Display the specified ticket.
     */
    public function show(string $id)
    {
        $ticket = auth()->user()->tickets()->find($id);

        if (!$ticket) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ticket not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $ticket
        ]);
    }

    /**
     * Update the specified ticket.
     */
    public function update(Request $request, string $id)
    {
        $ticket = auth()->user()->tickets()->find($id);

        if (!$ticket) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ticket not found'
            ], 404);
        }

        // Only allow updates for pending tickets
        if ($ticket->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot update a non-pending ticket'
            ], 400);
        }

        $validated = $request->validate([
            'match_title' => 'sometimes|string|max:255',
            'match_date' => 'sometimes|date|after:now',
            'seat_number' => 'nullable|string|max:50',
            'category' => 'sometimes|in:vip,premium,regular,economy',
            'price' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:pending,active,cancelled',
        ]);

        $ticket->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket updated successfully',
            'data' => $ticket
        ]);
    }

    /**
     * Remove the specified ticket (cancel).
     */
    public function destroy(string $id)
    {
        $ticket = auth()->user()->tickets()->find($id);

        if (!$ticket) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ticket not found'
            ], 404);
        }

        // Only allow cancellation for pending or active tickets
        if (!in_array($ticket->status, ['pending', 'active'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot cancel this ticket'
            ], 400);
        }

        $ticket->update(['status' => 'cancelled']);

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket cancelled successfully'
        ]);
    }

    /**
     * Confirm/activate a pending ticket (admin or payment callback).
     */
    public function confirm(string $id)
    {
        $ticket = auth()->user()->tickets()->find($id);

        if (!$ticket) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ticket not found'
            ], 404);
        }

        if ($ticket->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only pending tickets can be confirmed'
            ], 400);
        }

        $ticket->update(['status' => 'active']);

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket confirmed successfully',
            'data' => $ticket
        ]);
    }
}
