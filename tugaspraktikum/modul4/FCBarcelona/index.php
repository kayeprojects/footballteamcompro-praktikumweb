<?php

spl_autoload_register(function ($class) {
    $prefix = 'FCBarcelona\\';
    $base_dir = __DIR__ . '/classes/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});


use FCBarcelona\Player;
use FCBarcelona\Coach;

echo "====================================\n";
echo "   SISTEM MANAJEMEN FC BARCELONA   \n";
echo "====================================\n\n";

// ========== PEMAIN ==========
echo ">>> PEMAIN FC BARCELONA <<<\n";

$player1 = new Player("Robert Lewandowski", 35, "Polandia", 9, "Striker");
$player2 = new Player("Pedri González", 21, "Spanyol", 8, "Gelandang");
$player3 = new Player("Raphinha", 29, "Brasil", 11, "Winger");

echo "Role {$player1->role}: Penyerang utama\n";
echo "Role {$player2->role}: Pengatur serangan\n";
echo "Role {$player3->role}: Winger Top-Class\n\n";

echo $player1->scoreGoal(5) . "\n";
echo $player2->scoreGoal(2) . "\n";
echo $player3->scoreGoal(3) . "\n\n";

echo "Info Lengkap Pemain:\n";
echo "1. " . $player1 . "\n";
echo "2. " . $player2 . "\n";
echo "3. " . $player3 . "\n\n";

// Statistik
echo "Tabel Statistik Pemain:\n";
echo str_repeat("-", 70) . "\n";
printf("| %-25s | %-8s | %-15s | %-8s |\n", "Nama", "Jersey", "Posisi", "Gol");
echo str_repeat("-", 70) . "\n";

foreach ([$player1, $player2, $player3] as $p) {
    $s = $p->getPlayerStats();
    printf("| %-25s | %-8s | %-15s | %-8s |\n",
        $s['name'], "#" . $s['jersey'], $s['position'], $s['goals']
    );
}

echo str_repeat("-", 70) . "\n\n";

// Magic method get
echo "Test Magic Method __get():\n";
echo "Nama pemain: " . $player1->name . "\n";
echo "Property tidak ada: " . $player1->salary . "\n\n";

// ========== PELATIH ==========
echo ">>> PELATIH FC BARCELONA <<<\n";

$coach = new Coach("Rifky Rofiq", 21, "Indonesia", 2, "Tiki-Taka");

echo $coach->giveInstruction("Play High Defensive Line with Total Football!") . "\n";
echo $coach->giveInstruction("Go to Low Block and Hold until full time!") . "\n\n";

echo "Menambahkan Prestasi:\n";
echo $coach->addAchievement("La Liga Champion 2024/25") . "\n";
echo $coach->addAchievement("Supercopa de España 2024") . "\n";
echo $coach->addAchievement("UEFA Champions League 2026") . "\n\n";

echo "Info Pelatih:\n" . $coach . "\n\n";

// Profil lengkap
$profile = $coach->getCoachProfile();
echo "Profil Lengkap Pelatih:\n";
echo str_repeat("=", 50) . "\n";
echo "Nama          : {$profile['name']}\n";
echo "Umur          : {$profile['age']} tahun\n";
echo "Kebangsaan    : " . $coach->getNationality() . "\n";
echo "Pengalaman    : {$profile['experience']} tahun\n";
echo "Spesialisasi  : {$profile['specialty']}\n";
echo "Jumlah Trofi  : " . count($profile['achievements']) . "\n";

echo "\nDaftar Prestasi:\n";
foreach ($profile['achievements'] as $i => $ach) {
    echo "  " . ($i + 1) . ". {$ach}\n";
}
echo str_repeat("=", 50) . "\n\n";


echo ">>> DEMONSTRASI POLIMORFISME <<<\n";
echo "--------------------------------\n";

$teamMembers = [$player1, $player2, $coach];

foreach ($teamMembers as $i => $m) {
    echo ($i + 1) . ". " . $m->getInfo() . "\n";
}

echo "\n====================================\n";
echo "  Visca el Barça! Visca Catalunya!  \n";
echo "====================================\n";

?>
