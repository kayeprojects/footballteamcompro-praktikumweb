<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('match_title');
            $table->dateTime('match_date');
            $table->string('seat_number')->nullable();
            $table->enum('category', ['vip', 'premium', 'regular', 'economy'])->default('regular');
            $table->decimal('price', 12, 2);
            $table->enum('status', ['pending', 'active', 'used', 'cancelled', 'expired'])->default('pending');
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('match_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
