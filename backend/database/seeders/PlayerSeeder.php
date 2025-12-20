<?php

namespace Database\Seeders;

use App\Models\Player;
use Illuminate\Database\Seeder;

class PlayerSeeder extends Seeder
{
    public function run(): void
    {
        $players = [
            ['name' => 'Marc-André ter Stegen', 'number' => 1, 'position' => 'Goalkeeper', 'image' => null],
            ['name' => 'Pau Cubarsí', 'number' => 2, 'position' => 'Defender', 'image' => null],
            ['name' => 'Alejandro Balde', 'number' => 3, 'position' => 'Defender', 'image' => null],
            ['name' => 'Ronald Araújo', 'number' => 4, 'position' => 'Defender', 'image' => null],
            ['name' => 'Iñigo Martínez', 'number' => 5, 'position' => 'Defender', 'image' => null],
            ['name' => 'Gavi', 'number' => 6, 'position' => 'Midfielder', 'image' => null],
            ['name' => 'Ferran Torres', 'number' => 7, 'position' => 'Forward', 'image' => null],
            ['name' => 'Pedri', 'number' => 8, 'position' => 'Midfielder', 'image' => null],
            ['name' => 'Robert Lewandowski', 'number' => 9, 'position' => 'Forward', 'image' => null],
            ['name' => 'Ansu Fati', 'number' => 10, 'position' => 'Forward', 'image' => null],
            ['name' => 'Raphinha', 'number' => 11, 'position' => 'Forward', 'image' => null],
            ['name' => 'Iñaki Peña', 'number' => 13, 'position' => 'Goalkeeper', 'image' => null],
            ['name' => 'Fermin Lopez', 'number' => 16, 'position' => 'Midfielder', 'image' => null],
            ['name' => 'Lamine Yamal', 'number' => 19, 'position' => 'Forward', 'image' => null],
            ['name' => 'Dani Olmo', 'number' => 20, 'position' => 'Midfielder', 'image' => null],
            ['name' => 'Frenkie de Jong', 'number' => 21, 'position' => 'Midfielder', 'image' => null],
            ['name' => 'Jules Koundé', 'number' => 23, 'position' => 'Defender', 'image' => null],
            ['name' => 'Eric García', 'number' => 24, 'position' => 'Defender', 'image' => null],
        ];

        foreach ($players as $player) {
            Player::create($player);
        }
    }
}
