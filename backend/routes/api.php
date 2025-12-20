<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\FootballApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// ============================================
// PUBLIC AUTH ROUTES (No Authentication Required)
// ============================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ============================================
// PROTECTED AUTH ROUTES (JWT Required)
// ============================================
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);
});

// ============================================
// FOOTBALL API ROUTES (Proxy to football-data.org)
// ============================================
Route::prefix('football')->group(function () {
    // Team endpoints
    Route::get('/teams/{teamId}', [FootballApiController::class, 'getTeam']);
    Route::get('/teams/{teamId}/players', [FootballApiController::class, 'getPlayers']);
    Route::get('/teams/{teamId}/matches', [FootballApiController::class, 'getMatches']);
    Route::get('/teams', [FootballApiController::class, 'searchTeams']);
    
    // Player endpoints
    Route::get('/players/{playerId}', [FootballApiController::class, 'getPlayer']);
    
    // Competition endpoints
    Route::get('/competitions', [FootballApiController::class, 'getCompetitions']);
    Route::get('/competitions/{competitionId}/standings', [FootballApiController::class, 'getStandings']);
    Route::get('/competitions/{competitionId}/scorers', [FootballApiController::class, 'getScorers']);
});

// News endpoint (FC Barcelona RSS feed)
Route::get('/news', [FootballApiController::class, 'getNews']);

// ============================================
// TICKET ROUTES
// ============================================
// Public: View available tickets info (optional, based on requirements)
// Route::get('/tickets/available', [TicketController::class, 'available']);

// Protected: User's ticket management (JWT Required)
Route::middleware('auth:api')->group(function () {
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::put('/tickets/{id}', [TicketController::class, 'update']);
    Route::post('/tickets/{id}', [TicketController::class, 'update']); // For form-data with _method=PUT
    Route::delete('/tickets/{id}', [TicketController::class, 'destroy']);
    Route::post('/tickets/{id}/confirm', [TicketController::class, 'confirm']);
});
