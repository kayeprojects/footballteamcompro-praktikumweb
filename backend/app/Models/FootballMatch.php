<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class FootballMatch extends Model
{
    use HasFactory;

    protected $table = 'matches';

    protected $fillable = [
        'uuid',
        'title',
        'match_date',
        'venue',
        'competition',
        'home_team',
        'away_team',
        'home_team_logo',
        'away_team_logo',
        'total_seats',
        'available_seats',
        'status',
    ];

    protected $casts = [
        'match_date' => 'datetime',
        'total_seats' => 'integer',
        'available_seats' => 'integer',
    ];

    /**
     * Boot method to auto-generate UUID
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName()
    {
        return 'uuid';
    }

    /**
     * Get the tickets for this match.
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'match_id');
    }

    /**
     * Scope for upcoming matches
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming')
                     ->where('match_date', '>', now());
    }

    /**
     * Scope for available matches (has seats)
     */
    public function scopeAvailable($query)
    {
        return $query->where('available_seats', '>', 0);
    }

    /**
     * Check if match has available seats
     */
    public function hasAvailableSeats(): bool
    {
        return $this->available_seats > 0;
    }

    /**
     * Decrement available seats
     */
    public function decrementSeats(int $count = 1): bool
    {
        if ($this->available_seats >= $count) {
            $this->decrement('available_seats', $count);
            return true;
        }
        return false;
    }

    /**
     * Increment available seats (for cancellations)
     */
    public function incrementSeats(int $count = 1): void
    {
        $this->increment('available_seats', min($count, $this->total_seats - $this->available_seats));
    }
}
