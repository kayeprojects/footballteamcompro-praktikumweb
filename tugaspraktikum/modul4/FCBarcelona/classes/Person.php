<?php

namespace FCBarcelona;

class Person {
    // PROPERTY dengan Access Modifier berbeda
    protected string $name;        
    protected int $age;            
    private string $nationality;   
    public string $role;    
    

    public function __construct(string $name, int $age, string $nationality, string $role) {
        $this->name = $name;
        $this->age = $age;
        $this->nationality = $nationality;
        $this->role = $role;
    }
    
    
    public function getInfo(): string {
        return "Nama: {$this->name}, Umur: {$this->age}, Kebangsaan: {$this->nationality}, Peran: {$this->role}";
    }
    
    
    public function getNationality(): string {
        return $this->nationality;
    }
    
    public function __toString(): string {
        return $this->getInfo();
    }
    

    public function __get(string $property) {
        if ($property === 'name') {
            return $this->name;
        }
        return "Property '{$property}' tidak dapat diakses";
    }
}
?>
