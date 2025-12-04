<?php

namespace FCBarcelona;

class Player extends Person {
    private int $jerseyNumber;
    private string $position;
    private int $goals;
    
   
    public function __construct(string $name, int $age, string $nationality, int $jerseyNumber, string $position) {
        parent::__construct($name, $age, $nationality, "Pemain");
        $this->jerseyNumber = $jerseyNumber;
        $this->position = $position;
        $this->goals = 0;
    }
    
   
    public function scoreGoal(int $amount = 1): string {
        $this->goals += $amount;
        return "{$this->name} mencetak {$amount} gol! Total: {$this->goals} gol";
    }
    
    
    public function getPlayerStats(): array {
        return [
            'name' => $this->name,
            'jersey' => $this->jerseyNumber,
            'position' => $this->position,
            'goals' => $this->goals,
            'age' => $this->age
        ];
    }
    
    
    public function getInfo(): string {
        return parent::getInfo() . ", Nomor Punggung: {$this->jerseyNumber}, Posisi: {$this->position}, Gol: {$this->goals}";
    }

    public function getJerseyNumber(): int {
        return $this->jerseyNumber;
    }
}
?>
