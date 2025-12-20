// Players Page JavaScript
const API_BASE_URL = '/api';
const TEAM_ID = 81; // FC Barcelona

let allPlayers = [];
let currentFilter = 'all';

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadPlayers();
    
    window.toggleMobileMenu = toggleMobileMenu;
    window.filterByPosition = filterByPosition;
    window.searchPlayers = searchPlayers;
    window.loadPlayers = loadPlayers;
});

// ============================================
// Load Players
// ============================================
async function loadPlayers() {
    showLoading();
    
    try {
        // Try backend proxy first
        const response = await fetch(`${API_BASE_URL}/football/teams/${TEAM_ID}/players`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data.players) {
            allPlayers = data.data.players;
            renderPlayers(allPlayers);
        } else {
            throw new Error('Invalid response');
        }
    } catch (error) {
        console.log('Backend proxy failed, trying direct API...');
        try {
            // Fallback to Vite proxy
            const directResponse = await fetch(`/football-api/v4/teams/${TEAM_ID}`);
            const data = await directResponse.json();
            
            if (data.squad) {
                allPlayers = data.squad;
                renderPlayers(allPlayers);
            } else {
                throw new Error('No squad data');
            }
        } catch (e) {
            console.error('Failed to load players:', e);
            showError();
        }
    }
}

// ============================================
// Render Players
// ============================================
function renderPlayers(players) {
    const grid = document.getElementById('players-grid');
    const countEl = document.getElementById('player-count');
    
    hideAllStates();
    
    if (players.length === 0) {
        showEmpty();
        countEl.textContent = '0';
        return;
    }
    
    grid.classList.remove('hidden');
    countEl.textContent = players.length;
    
    grid.innerHTML = players.map(player => createPlayerCard(player)).join('');
}

function createPlayerCard(player) {
    const position = player.position || 'Unknown';
    const positionColor = getPositionColor(position);
    const number = player.shirtNumber || '?';
    const nationality = player.nationality || '';
    
    return `
        <div class="player-card bg-white rounded-xl shadow-lg overflow-hidden" data-position="${position}">
            <div class="relative">
                <!-- Player Photo or Number -->
                <div class="h-40 gradient-bg flex items-center justify-center player-photo">
                    <span class="text-white text-5xl font-bold">#${number}</span>
                </div>
                <!-- Position Badge -->
                <div class="absolute top-2 left-2 ${positionColor} text-white px-2 py-1 rounded text-xs font-semibold uppercase">
                    ${formatPosition(position)}
                </div>
                <!-- Number Badge -->
                <div class="absolute bottom-0 right-2 transform translate-y-1/2 bg-white text-blue-900 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-blue-900">
                    ${number}
                </div>
            </div>
            <div class="p-4 pt-6">
                <h3 class="font-bold text-lg text-gray-800 truncate" title="${player.name}">${player.name}</h3>
                <p class="text-gray-600 text-sm">${position}</p>
                ${nationality ? `<p class="text-gray-500 text-xs mt-1"><i class="fas fa-flag mr-1"></i>${nationality}</p>` : ''}
            </div>
        </div>
    `;
}

function getPositionColor(position) {
    const colors = {
        'Goalkeeper': 'bg-yellow-500',
        'Defence': 'bg-green-500',
        'Left-Back': 'bg-green-500',
        'Right-Back': 'bg-green-500',
        'Centre-Back': 'bg-green-500',
        'Midfield': 'bg-blue-500',
        'Central Midfield': 'bg-blue-500',
        'Defensive Midfield': 'bg-blue-500',
        'Attacking Midfield': 'bg-blue-500',
        'Offence': 'bg-red-500',
        'Centre-Forward': 'bg-red-500',
        'Left Winger': 'bg-red-500',
        'Right Winger': 'bg-red-500'
    };
    return colors[position] || 'bg-gray-500';
}

function formatPosition(position) {
    const short = {
        'Goalkeeper': 'GK',
        'Defence': 'DEF',
        'Left-Back': 'LB',
        'Right-Back': 'RB',
        'Centre-Back': 'CB',
        'Midfield': 'MID',
        'Central Midfield': 'CM',
        'Defensive Midfield': 'DM',
        'Attacking Midfield': 'AM',
        'Offence': 'FWD',
        'Centre-Forward': 'CF',
        'Left Winger': 'LW',
        'Right Winger': 'RW'
    };
    return short[position] || position.substring(0, 3).toUpperCase();
}

// ============================================
// Filters & Search
// ============================================
function filterByPosition(position) {
    currentFilter = position;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.position === position) {
            btn.classList.add('active');
        }
    });
    
    applyFilters();
}

function searchPlayers(query) {
    applyFilters(query.toLowerCase());
}

function applyFilters(searchQuery = '') {
    let filtered = allPlayers;
    
    // Position filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(player => {
            const pos = player.position || '';
            if (currentFilter === 'Defence') {
                return pos.includes('Back') || pos === 'Defence';
            }
            if (currentFilter === 'Offence') {
                return pos.includes('Forward') || pos.includes('Winger') || pos === 'Offence';
            }
            return pos.includes(currentFilter);
        });
    }
    
    // Search filter
    if (searchQuery) {
        filtered = filtered.filter(player => 
            player.name.toLowerCase().includes(searchQuery) ||
            (player.nationality && player.nationality.toLowerCase().includes(searchQuery))
        );
    }
    
    renderPlayers(filtered);
}

// ============================================
// UI States
// ============================================
function showLoading() {
    hideAllStates();
    document.getElementById('loading-state').classList.remove('hidden');
}

function showEmpty() {
    hideAllStates();
    document.getElementById('empty-state').classList.remove('hidden');
}

function showError() {
    hideAllStates();
    document.getElementById('error-state').classList.remove('hidden');
}

function hideAllStates() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('players-grid').classList.add('hidden');
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
}

function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('hidden');
}
