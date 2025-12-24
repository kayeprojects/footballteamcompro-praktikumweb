<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FootballMatch;
use Illuminate\Support\Str;

class MatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $matches = [
            [
                'title' => 'FC Barcelona vs Real Madrid',
                'match_date' => now()->addDays(7)->setTime(21, 0),
                'venue' => 'Camp Nou',
                'competition' => 'La Liga',
                'home_team' => 'FC Barcelona',
                'away_team' => 'Real Madrid',
                'home_team_logo' => 'https://crests.football-data.org/81.png',
                'away_team_logo' => 'https://crests.football-data.org/86.png',
                'total_seats' => 100,
                'available_seats' => 100,
                'status' => 'upcoming',
            ],
            [
                'title' => 'FC Barcelona vs Atletico Madrid',
                'match_date' => now()->addDays(14)->setTime(20, 0),
                'venue' => 'Camp Nou',
                'competition' => 'La Liga',
                'home_team' => 'FC Barcelona',
                'away_team' => 'Atletico Madrid',
                'home_team_logo' => 'https://crests.football-data.org/81.png',
                'away_team_logo' => 'https://crests.football-data.org/78.png',
                'total_seats' => 100,
                'available_seats' => 100,
                'status' => 'upcoming',
            ],
            [
                'title' => 'Valencia CF vs FC Barcelona',
                'match_date' => now()->addDays(21)->setTime(18, 30),
                'venue' => 'Mestalla',
                'competition' => 'La Liga',
                'home_team' => 'Valencia CF',
                'away_team' => 'FC Barcelona',
                'home_team_logo' => 'https://crests.football-data.org/95.png',
                'away_team_logo' => 'https://crests.football-data.org/81.png',
                'total_seats' => 80,
                'available_seats' => 80,
                'status' => 'upcoming',
            ],
            [
                'title' => 'FC Barcelona vs Bayern Munich',
                'match_date' => now()->addDays(28)->setTime(21, 0),
                'venue' => 'Camp Nou',
                'competition' => 'UEFA Champions League',
                'home_team' => 'FC Barcelona',
                'away_team' => 'Bayern Munich',
                'home_team_logo' => 'https://crests.football-data.org/81.png',
                'away_team_logo' => 'https://crests.football-data.org/5.png',
                'total_seats' => 100,
                'available_seats' => 100,
                'status' => 'upcoming',
            ],
            [
                'title' => 'FC Barcelona vs Sevilla FC',
                'match_date' => now()->addDays(35)->setTime(20, 0),
                'venue' => 'Camp Nou',
                'competition' => 'La Liga',
                'home_team' => 'FC Barcelona',
                'away_team' => 'Sevilla FC',
                'home_team_logo' => 'https://crests.football-data.org/81.png',
                'away_team_logo' => 'https://crests.football-data.org/559.png',
                'total_seats' => 100,
                'available_seats' => 100,
                'status' => 'upcoming',
            ],
            [
                'title' => 'Real Sociedad vs FC Barcelona',
                'match_date' => now()->addDays(42)->setTime(19, 0),
                'venue' => 'Reale Arena',
                'competition' => 'La Liga',
                'home_team' => 'Real Sociedad',
                'away_team' => 'FC Barcelona',
                'home_team_logo' => 'https://crests.football-data.org/92.png',
                'away_team_logo' => 'https://crests.football-data.org/81.png',
                'total_seats' => 60,
                'available_seats' => 60,
                'status' => 'upcoming',
            ],
        ];

        foreach ($matches as $match) {
            FootballMatch::create($match);
        }

        $this->command->info('Seeded ' . count($matches) . ' matches successfully!');
    }
}
