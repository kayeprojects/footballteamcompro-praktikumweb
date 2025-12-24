<?php

namespace App\Http\Controllers;

use App\Models\FootballMatch;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    /**
     * Display a listing of matches.
     */
    public function index(Request $request)
    {
        $query = FootballMatch::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter upcoming only
        if ($request->has('upcoming') && $request->upcoming === 'true') {
            $query->upcoming();
        }

        // Filter available (has seats)
        if ($request->has('available') && $request->available === 'true') {
            $query->available();
        }

        // Sort options
        $sortBy = $request->input('sortBy', 'match_date');
        $order = $request->input('order', 'asc');
        $query->orderBy($sortBy, $order);

        // Pagination
        $limit = $request->input('limit', 10);
        $matches = $query->paginate($limit);

        return response()->json([
            'status' => 'success',
            'data' => $matches
        ]);
    }

    /**
     * Store a newly created match.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'match_date' => 'required|date|after:now',
            'venue' => 'nullable|string|max:255',
            'competition' => 'required|string|max:100',
            'home_team' => 'required|string|max:100',
            'away_team' => 'required|string|max:100',
            'home_team_logo' => 'nullable|url|max:500',
            'away_team_logo' => 'nullable|url|max:500',
            'total_seats' => 'nullable|integer|min:1|max:100000',
        ]);

        // Set available_seats to total_seats initially
        $validated['available_seats'] = $validated['total_seats'] ?? 100;
        $validated['total_seats'] = $validated['total_seats'] ?? 100;

        $match = FootballMatch::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Match created successfully',
            'data' => $match
        ], 201);
    }

    /**
     * Display the specified match.
     */
    public function show(string $uuid)
    {
        $match = FootballMatch::where('uuid', $uuid)->first();

        if (!$match) {
            return response()->json([
                'status' => 'error',
                'message' => 'Match not found'
            ], 404);
        }

        // Include ticket statistics
        $match->tickets_sold = $match->total_seats - $match->available_seats;
        $match->tickets_percentage = $match->total_seats > 0 
            ? round(($match->tickets_sold / $match->total_seats) * 100, 1) 
            : 0;

        return response()->json([
            'status' => 'success',
            'data' => $match
        ]);
    }

    /**
     * Update the specified match.
     */
    public function update(Request $request, string $uuid)
    {
        $match = FootballMatch::where('uuid', $uuid)->first();

        if (!$match) {
            return response()->json([
                'status' => 'error',
                'message' => 'Match not found'
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'match_date' => 'sometimes|date',
            'venue' => 'sometimes|string|max:255',
            'competition' => 'sometimes|string|max:100',
            'home_team' => 'sometimes|string|max:100',
            'away_team' => 'sometimes|string|max:100',
            'home_team_logo' => 'nullable|url|max:500',
            'away_team_logo' => 'nullable|url|max:500',
            'total_seats' => 'sometimes|integer|min:1|max:100000',
            'status' => 'sometimes|in:upcoming,ongoing,completed,cancelled',
        ]);

        // If total_seats changed, adjust available_seats proportionally
        if (isset($validated['total_seats']) && $validated['total_seats'] !== $match->total_seats) {
            $soldTickets = $match->total_seats - $match->available_seats;
            $validated['available_seats'] = max(0, $validated['total_seats'] - $soldTickets);
        }

        $match->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Match updated successfully',
            'data' => $match
        ]);
    }

    /**
     * Remove the specified match.
     */
    public function destroy(string $uuid)
    {
        $match = FootballMatch::where('uuid', $uuid)->first();

        if (!$match) {
            return response()->json([
                'status' => 'error',
                'message' => 'Match not found'
            ], 404);
        }

        // Check if match has active tickets
        $activeTickets = $match->tickets()->whereIn('status', ['pending', 'active'])->count();
        if ($activeTickets > 0) {
            return response()->json([
                'status' => 'error',
                'message' => "Cannot delete match with {$activeTickets} active ticket(s). Cancel tickets first."
            ], 400);
        }

        $match->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Match deleted successfully'
        ]);
    }

    /**
     * Get tickets for a specific match.
     */
    public function tickets(string $uuid)
    {
        $match = FootballMatch::where('uuid', $uuid)->first();

        if (!$match) {
            return response()->json([
                'status' => 'error',
                'message' => 'Match not found'
            ], 404);
        }

        $tickets = $match->tickets()->with('user:id,name,email')->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'match' => $match,
                'tickets' => $tickets
            ]
        ]);
    }
}
