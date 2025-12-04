<?php

namespace FCBarcelona;

class Coach extends Person {
    private int $experienceYears;
    private string $specialty;
    private array $achievements;
    
    public function __construct(string $name, int $age, string $nationality, int $experienceYears, string $specialty) {
        parent::__construct($name, $age, $nationality, "Pelatih");
        $this->experienceYears = $experienceYears;
        $this->specialty = $specialty;
        $this->achievements = [];
    }
    
   
    public function addAchievement(string $achievement): string {
        $this->achievements[] = $achievement;
        return "Prestasi '{$achievement}' berhasil ditambahkan untuk {$this->name}";
    }
    

    public function giveInstruction(string $instruction): string {
        return "{$this->name} memberikan instruksi: '{$instruction}'";
    }
    

    public function getCoachProfile(): array {
        return [
            'name' => $this->name,
            'age' => $this->age,
            'experience' => $this->experienceYears,
            'specialty' => $this->specialty,
            'achievements' => $this->achievements
        ];
    }
    
    public function getInfo(): string {
        $achievementCount = count($this->achievements);
        return parent::getInfo() . ", Pengalaman: {$this->experienceYears} tahun, Spesialisasi: {$this->specialty}, Prestasi: {$achievementCount}";
    }
}
?>
