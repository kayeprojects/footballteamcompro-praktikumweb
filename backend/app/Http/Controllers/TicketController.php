<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\FootballMatch;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    /**
     * Display a listing of the user's tickets.
     */
    public function index(Request $request)
    {
        $query = auth()->user()->tickets()->with('match');

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
     * Business Logic: Decrements match available_seats when ticket is purchased.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'match_uuid' => 'required|exists:matches,uuid',
            'category' => 'required|in:vip,premium,regular,economy',
        ]);

        // Find the match by UUID
        $match = FootballMatch::where('uuid', $validated['match_uuid'])->first();

        if (!$match) {
            return response()->json([
                'status' => 'error',
                'message' => 'Match not found'
            ], 404);
        }

        // Check if match is upcoming
        if ($match->status !== 'upcoming') {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot purchase tickets for this match'
            ], 400);
        }

        // Check available seats
        if (!$match->hasAvailableSeats()) {
            return response()->json([
                'status' => 'error',
                'message' => 'No seats available for this match'
            ], 400);
        }

        // Calculate price based on category
        $prices = [
            'vip' => 2500000,
            'premium' => 1500000,
            'regular' => 750000,
            'economy' => 350000,
        ];

        // Generate seat number
        $seatSection = strtoupper(substr($validated['category'], 0, 1)); // V, P, R, E
        $seatNumber = $seatSection . rand(1, 50) . '-' . rand(1, 30);

        // Create ticket
        $ticket = Ticket::create([
            'user_id' => auth()->id(),
            'match_id' => $match->id,
            'match_title' => $match->title,
            'match_date' => $match->match_date,
            'seat_number' => $seatNumber,
            'category' => $validated['category'],
            'price' => $prices[$validated['category']],
            'status' => 'pending',
        ]);

        // *** BUSINESS LOGIC: Decrement available seats ***
        $match->decrementSeats();

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket purchased successfully',
            'data' => $ticket->load('match')
        ], 201);
    }

    /**
     * Display the specified ticket.
     */
    public function show(string $uuid)
    {
        $ticket = auth()->user()->tickets()->with('match')->where('uuid', $uuid)->first();

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
    public function update(Request $request, string $uuid)
    {
        $ticket = auth()->user()->tickets()->where('uuid', $uuid)->first();

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
            'seat_number' => 'nullable|string|max:50',
            'category' => 'sometimes|in:vip,premium,regular,economy',
        ]);

        // Recalculate price if category changed
        if (isset($validated['category'])) {
            $prices = [
                'vip' => 2500000,
                'premium' => 1500000,
                'regular' => 750000,
                'economy' => 350000,
            ];
            $validated['price'] = $prices[$validated['category']];
        }

        $ticket->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket updated successfully',
            'data' => $ticket
        ]);
    }

    /**
     * Remove the specified ticket (cancel).
     * Business Logic: Increments match available_seats when ticket is cancelled.
     */
    public function destroy(string $uuid)
    {
        $ticket = auth()->user()->tickets()->with('match')->where('uuid', $uuid)->first();

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

        // *** BUSINESS LOGIC: Increment available seats ***
        if ($ticket->match) {
            $ticket->match->incrementSeats();
        }

        $ticket->update(['status' => 'cancelled']);

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket cancelled successfully'
        ]);
    }

    /**
     * Confirm/activate a pending ticket.
     */
    public function confirm(string $uuid)
    {
        $ticket = auth()->user()->tickets()->where('uuid', $uuid)->first();

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
