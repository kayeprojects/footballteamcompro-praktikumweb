# FC Barcelona Fan Website

A full-stack web application for FC Barcelona fans to browse team information, view upcoming matches, read news, and purchase tickets.

![FC Barcelona](https://crests.football-data.org/81.png)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Business Logic](#-business-logic)
- [Screenshots](#-screenshots)

---

## 🎯 Overview

This project is a comprehensive FC Barcelona fan portal built for a **Web Programming Final Project**. It demonstrates:

- **Full-stack development** with Laravel backend and JavaScript frontend
- **JWT Authentication** for secure user sessions
- **RESTful API** design with CRUD operations
- **Database relationships** between related tables
- **UUID identifiers** for secure URL-based access
- **External API integration** (football-data.org)
- **Modern UI/UX** with Tailwind CSS and scroll animations

### Theme

**Football Club Website** - A ticketing and information system for FC Barcelona supporters.

---

## ✨ Features

### 🏠 Landing Page

- Hero section with parallax effects and floating animations
- Club history and achievements
- Featured player cards with API data
- Upcoming matches with team logos
- Latest news from official RSS feed
- Official merchandise store
- Contact section with social links

### 🎫 Ticket Management

- Browse available matches
- Purchase tickets by category (VIP, Premium, Regular, Economy)
- Real-time seat availability tracking
- View and manage purchased tickets
- Confirm or cancel pending tickets

### 👤 User Authentication

- User registration with validation
- JWT-based login/logout
- Protected dashboard access
- Token refresh mechanism

### ⚽ Football Data Integration

- Live player roster from football-data.org API
- Upcoming match schedules
- Team information and logos
- Competition standings (La Liga, Champions League)

---

## 🛠 Technology Stack

### Backend

| Technology     | Version | Purpose              |
| -------------- | ------- | -------------------- |
| PHP            | 8.2+    | Server-side language |
| Laravel        | 12.x    | PHP Framework        |
| MySQL          | 8.0+    | Database             |
| tymon/jwt-auth | 2.x     | JWT Authentication   |

### Frontend

| Technology         | Purpose                 |
| ------------------ | ----------------------- |
| HTML5              | Structure               |
| Tailwind CSS       | Styling                 |
| Vanilla JavaScript | Interactivity           |
| Vite               | Build tool & dev server |
| Font Awesome       | Icons                   |

### External APIs

| API               | Purpose           |
| ----------------- | ----------------- |
| football-data.org | Player/match data |
| FC Barcelona RSS  | News feed         |

---

## 📁 Project Structure

```
praktikumweb/
├── backend/                          # Laravel Backend
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php    # JWT authentication
│   │   │   ├── MatchController.php   # Match CRUD
│   │   │   ├── TicketController.php  # Ticket CRUD + business logic
│   │   │   └── FootballApiController.php  # API proxy
│   │   └── Models/
│   │       ├── User.php              # User with JWT
│   │       ├── FootballMatch.php     # Match model
│   │       └── Ticket.php            # Ticket model
│   ├── database/
│   │   ├── migrations/               # Database schema
│   │   └── seeders/
│   │       └── MatchSeeder.php       # Sample data
│   ├── routes/
│   │   └── api.php                   # API routes
│   └── .env                          # Environment config
│
├── src/                              # Frontend
│   ├── index.html                    # Landing page
│   ├── dashboard.html                # User dashboard
│   ├── players.html                  # Squad page
│   ├── script.js                     # Landing page logic
│   ├── dashboard.js                  # Dashboard logic
│   ├── players.js                    # Players page logic
│   ├── styles.css                    # Custom styles
│   └── assets/images/                # Static images
│
├── vite.config.js                    # Vite configuration
├── postman_collection.json           # API testing
└── README.md                         # This file
```

---

## 🚀 Installation

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+
- Git

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd praktikumweb
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret

# Configure database in .env
# DB_DATABASE=praktikumweb
# DB_USERNAME=root
# DB_PASSWORD=

# Add football API key (optional)
# FOOTBALL_API_KEY=your_api_key_here

# Run migrations
php artisan migrate

# Seed sample data
php artisan db:seed --class=MatchSeeder

# Start server
php artisan serve
```

### Step 3: Frontend Setup

```bash
# From root directory
npm install

# Start development server
npm run dev
```

### Step 4: Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api

---

## 📡 API Documentation

### Authentication

| Method | Endpoint        | Description          | Auth |
| ------ | --------------- | -------------------- | ---- |
| POST   | `/api/register` | Create new user      | ❌   |
| POST   | `/api/login`    | Login, get JWT token | ❌   |
| POST   | `/api/logout`   | Invalidate token     | ✅   |
| POST   | `/api/refresh`  | Refresh JWT token    | ✅   |
| GET    | `/api/me`       | Get current user     | ✅   |

#### Register Request

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

#### Login Response

```json
{
  "status": "success",
  "data": {
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

---

### Matches (UUID-based)

| Method | Endpoint              | Description       | Auth |
| ------ | --------------------- | ----------------- | ---- |
| GET    | `/api/matches`        | List all matches  | ❌   |
| GET    | `/api/matches/{uuid}` | Get match details | ❌   |
| POST   | `/api/matches`        | Create match      | ✅   |
| PUT    | `/api/matches/{uuid}` | Update match      | ✅   |
| DELETE | `/api/matches/{uuid}` | Delete match      | ✅   |

#### Query Parameters

- `upcoming=true` - Only upcoming matches
- `available=true` - Only matches with seats
- `status=upcoming|ongoing|completed|cancelled`
- `limit=10`

#### Match Object

```json
{
  "id": 1,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "title": "FC Barcelona vs Real Madrid",
  "match_date": "2025-01-15T21:00:00",
  "venue": "Camp Nou",
  "competition": "La Liga",
  "home_team": "FC Barcelona",
  "away_team": "Real Madrid",
  "total_seats": 100,
  "available_seats": 95,
  "status": "upcoming"
}
```

---

### Tickets (UUID-based, Protected)

| Method | Endpoint                      | Description            |
| ------ | ----------------------------- | ---------------------- |
| GET    | `/api/tickets`                | List user's tickets    |
| POST   | `/api/tickets`                | Purchase ticket        |
| GET    | `/api/tickets/{uuid}`         | Get ticket details     |
| PUT    | `/api/tickets/{uuid}`         | Update ticket          |
| DELETE | `/api/tickets/{uuid}`         | Cancel ticket          |
| POST   | `/api/tickets/{uuid}/confirm` | Confirm pending ticket |

#### Purchase Ticket Request

```json
{
  "match_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "category": "premium"
}
```

#### Ticket Categories & Prices

| Category | Price (IDR)  |
| -------- | ------------ |
| VIP      | Rp 2,500,000 |
| Premium  | Rp 1,500,000 |
| Regular  | Rp 750,000   |
| Economy  | Rp 350,000   |

---

### Football API Proxy

| Method | Endpoint                           | Description               |
| ------ | ---------------------------------- | ------------------------- |
| GET    | `/api/football/teams/{id}`         | Get team info             |
| GET    | `/api/football/teams/{id}/players` | Get squad                 |
| GET    | `/api/football/teams/{id}/matches` | Get matches               |
| GET    | `/api/news`                        | Get FC Barcelona RSS news |

> FC Barcelona Team ID: **81**

---

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │   tickets   │       │   matches   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │    ┌──│ id (PK)     │
│ name        │  │    │ uuid (UK)   │    │  │ uuid (UK)   │
│ email       │  └───>│ user_id (FK)│    │  │ title       │
│ password    │       │ match_id(FK)│<───┘  │ match_date  │
│ timestamps  │       │ match_title │       │ venue       │
└─────────────┘       │ match_date  │       │ competition │
                      │ seat_number │       │ home_team   │
                      │ category    │       │ away_team   │
                      │ price       │       │ total_seats │
                      │ status      │       │ avail_seats │
                      │ timestamps  │       │ status      │
                      └─────────────┘       │ timestamps  │
                                            └─────────────┘

  Relationships:
  - User hasMany Tickets
  - Ticket belongsTo User
  - Match hasMany Tickets
  - Ticket belongsTo Match
```

### Tables

#### users

| Column     | Type      | Description      |
| ---------- | --------- | ---------------- |
| id         | bigint    | Primary key      |
| name       | varchar   | User's full name |
| email      | varchar   | Unique email     |
| password   | varchar   | Hashed password  |
| created_at | timestamp | Record creation  |
| updated_at | timestamp | Last update      |

#### matches

| Column          | Type     | Description                             |
| --------------- | -------- | --------------------------------------- |
| id              | bigint   | Primary key                             |
| uuid            | uuid     | Unique identifier for URLs              |
| title           | varchar  | e.g., "Barcelona vs Real Madrid"        |
| match_date      | datetime | Match date and time                     |
| venue           | varchar  | Stadium name                            |
| competition     | varchar  | La Liga, Champions League, etc.         |
| home_team       | varchar  | Home team name                          |
| away_team       | varchar  | Away team name                          |
| home_team_logo  | varchar  | Logo URL (nullable)                     |
| away_team_logo  | varchar  | Logo URL (nullable)                     |
| total_seats     | int      | Maximum capacity                        |
| available_seats | int      | Remaining seats                         |
| status          | enum     | upcoming, ongoing, completed, cancelled |

#### tickets

| Column      | Type     | Description                               |
| ----------- | -------- | ----------------------------------------- |
| id          | bigint   | Primary key                               |
| uuid        | uuid     | Unique identifier for URLs                |
| user_id     | bigint   | Foreign key to users                      |
| match_id    | bigint   | Foreign key to matches                    |
| match_title | varchar  | Denormalized for display                  |
| match_date  | datetime | Denormalized for display                  |
| seat_number | varchar  | e.g., "V15-23"                            |
| category    | enum     | vip, premium, regular, economy            |
| price       | decimal  | Ticket price                              |
| status      | enum     | pending, active, used, cancelled, expired |

---

## ⚙️ Business Logic

### Ticket Purchase Flow

```
1. User selects match from dashboard
2. Frontend sends: { match_uuid, category }
3. Backend validates:
   - Match exists and is 'upcoming'
   - Match has available seats
4. Ticket created with:
   - Auto-generated UUID
   - Auto-generated seat number (e.g., "P12-5")
   - Price based on category
   - Status: 'pending'
5. *** BUSINESS LOGIC ***
   Match.available_seats decremented by 1
6. Response includes ticket with match data
```

### Ticket Cancellation Flow

```
1. User clicks cancel on pending/active ticket
2. Backend validates:
   - Ticket belongs to user
   - Status is 'pending' or 'active'
3. Ticket status updated to 'cancelled'
4. *** BUSINESS LOGIC ***
   Match.available_seats incremented by 1
5. Frontend refreshes ticket list and match seats
```

### Code Implementation

```php
// TicketController.php - Purchase
public function store(Request $request) {
    $match = FootballMatch::where('uuid', $request->match_uuid)->first();

    // Validate
    if (!$match->hasAvailableSeats()) {
        return response()->json(['error' => 'No seats available'], 400);
    }

    // Create ticket
    $ticket = Ticket::create([...]);

    // BUSINESS LOGIC: Decrement seats
    $match->decrementSeats();

    return response()->json(['data' => $ticket], 201);
}

// TicketController.php - Cancel
public function destroy(string $uuid) {
    $ticket = Ticket::where('uuid', $uuid)->first();

    // BUSINESS LOGIC: Increment seats
    $ticket->match->incrementSeats();

    $ticket->update(['status' => 'cancelled']);
}
```

---

## 🔐 Security Features

1. **JWT Authentication** - Stateless token-based auth
2. **Password Hashing** - bcrypt with Laravel's built-in casting
3. **API Key Protection** - Football API key stored in backend .env
4. **User Ownership** - Users can only access their own tickets
5. **Input Validation** - Laravel request validation
6. **CORS** - Configured for frontend origin

---

## 📱 Frontend Features

### Scroll Effects

- **Parallax backgrounds** - Fixed attachment on sections
- **Scroll reveal** - Elements fade in as you scroll
- **Floating shapes** - Animated circles in hero

### UI Components

- Glassmorphism cards
- Custom scrollbar
- Loading skeletons
- Toast notifications
- Modal dialogs
- Responsive navigation

---

## 🧪 Testing

### Postman Collection

Import `postman_collection.json` to test all API endpoints.

### Manual Testing

1. Register a new user
2. Login to get JWT token
3. View matches on dashboard
4. Purchase a ticket (check seat count decreases)
5. Cancel the ticket (check seat count increases)

---

## 📄 License

This project is created for educational purposes as part of a Web Programming course final project.

---

## 👤 Author

**Rifky** - Web Programming Final Project 2024

---

## 🙏 Acknowledgments

- [football-data.org](https://www.football-data.org/) for match and player data
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Laravel](https://laravel.com/) for the backend framework
- [FC Barcelona](https://www.fcbarcelona.com/) for inspiration
