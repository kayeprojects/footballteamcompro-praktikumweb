// Dashboard JavaScript
// API Configuration
const API_BASE_URL = '/api';
const TEAM_ID = 81; // FC Barcelona

// Auth State
let authToken = localStorage.getItem('auth_token');
let currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');
let allTickets = [];

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Make functions globally available
    window.logout = logout;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.handleLoginSubmit = handleLoginSubmit;
    window.handleRegisterSubmit = handleRegisterSubmit;
    window.handleBuyTicketSubmit = handleBuyTicketSubmit;
    window.cancelTicket = cancelTicket;
    window.confirmTicket = confirmTicket;
    window.showBuyTicketModal = showBuyTicketModal;
    window.filterTickets = filterTickets;
    window.updatePriceDisplay = updatePriceDisplay;
    window.toggleMobileMenu = toggleMobileMenu;
});

function checkAuth() {
    if (!authToken || !currentUser) {
        showAuthRequired();
    } else {
        showDashboard();
        loadDashboardData();
    }
}

function showAuthRequired() {
    document.getElementById('auth-required').classList.remove('hidden');
    document.getElementById('dashboard-content').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('auth-required').classList.add('hidden');
    document.getElementById('dashboard-content').classList.remove('hidden');
    
    // Update user name displays
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('welcome-name').textContent = currentUser.name.split(' ')[0];
}

function loadDashboardData() {
    loadUserTickets();
    loadUpcomingMatches();
}

// ============================================
// API Helper
// ============================================
async function apiRequest(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                logout();
            }
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================
// Authentication
// ============================================
async function register(name, email, password, passwordConfirmation) {
    try {
        const response = await apiRequest('/register', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation
            })
        });

        if (response.status === 'success') {
            authToken = response.data.token;
            currentUser = response.data.user;
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('current_user', JSON.stringify(currentUser));
            showToast('Registration successful!', 'success');
            closeModal('registerModal');
            showDashboard();
            loadDashboardData();
            return true;
        }
    } catch (error) {
        showToast(error.message || 'Registration failed', 'error');
        return false;
    }
}

async function login(email, password) {
    try {
        const response = await apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.status === 'success') {
            authToken = response.data.token;
            currentUser = response.data.user;
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('current_user', JSON.stringify(currentUser));
            showToast('Login successful!', 'success');
            closeModal('loginModal');
            showDashboard();
            loadDashboardData();
            return true;
        }
    } catch (error) {
        showToast(error.message || 'Login failed', 'error');
        return false;
    }
}

async function logout() {
    try {
        if (authToken) {
            await apiRequest('/logout', { method: 'POST' });
        }
    } catch (error) {
        console.log('Logout error:', error);
    } finally {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        showToast('Logged out successfully', 'success');
        // Redirect to home page
        window.location.href = 'index.html';
    }
}

// ============================================
// Tickets
// ============================================
async function loadUserTickets() {
    const loadingEl = document.getElementById('tickets-loading');
    const listEl = document.getElementById('tickets-list');
    const emptyEl = document.getElementById('tickets-empty');

    loadingEl.classList.remove('hidden');
    listEl.classList.add('hidden');
    emptyEl.classList.add('hidden');

    try {
        const response = await apiRequest('/tickets');
        if (response.status === 'success') {
            allTickets = response.data.data || [];
            updateStats(allTickets);
            renderTickets(allTickets);
        }
    } catch (error) {
        console.error('Failed to load tickets:', error);
        loadingEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
    }
}

function updateStats(tickets) {
    const total = tickets.length;
    const active = tickets.filter(t => t.status === 'active').length;
    const pending = tickets.filter(t => t.status === 'pending').length;
    const upcoming = tickets.filter(t => new Date(t.match_date) > new Date()).length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-active').textContent = active;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-upcoming').textContent = upcoming;
}

function renderTickets(tickets) {
    const loadingEl = document.getElementById('tickets-loading');
    const listEl = document.getElementById('tickets-list');
    const emptyEl = document.getElementById('tickets-empty');

    loadingEl.classList.add('hidden');

    if (tickets.length === 0) {
        listEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
        return;
    }

    listEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');

    listEl.innerHTML = tickets.map(ticket => `
        <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div class="flex flex-col md:flex-row">
                <div class="md:w-2 ${getTicketBorderColor(ticket.status)}"></div>
                <div class="flex-1 p-6">
                    <div class="flex flex-col md:flex-row justify-between">
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-gray-800 mb-2">${ticket.match_title}</h3>
                            <div class="flex flex-wrap gap-4 text-gray-600 text-sm mb-3">
                                <span><i class="far fa-calendar mr-2"></i>${formatDate(ticket.match_date)}</span>
                                <span><i class="fas fa-chair mr-2"></i>Seat: ${ticket.seat_number || 'TBA'}</span>
                            </div>
                            <div class="flex gap-2">
                                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold uppercase">${ticket.category}</span>
                                <span class="px-3 py-1 ${getStatusBadge(ticket.status)} rounded-full text-xs font-semibold uppercase">${ticket.status}</span>
                            </div>
                        </div>
                        <div class="mt-4 md:mt-0 md:text-right">
                            <p class="text-2xl font-bold text-blue-900 mb-2">Rp ${formatPrice(ticket.price)}</p>
                            <div class="flex gap-2 justify-start md:justify-end">
                                ${ticket.status === 'pending' ? `
                                    <button onclick="confirmTicket(${ticket.id})" class="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition">
                                        <i class="fas fa-check mr-1"></i> Confirm
                                    </button>
                                ` : ''}
                                ${['pending', 'active'].includes(ticket.status) ? `
                                    <button onclick="cancelTicket(${ticket.id})" class="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition">
                                        <i class="fas fa-times mr-1"></i> Cancel
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function filterTickets(status) {
    if (status === 'all') {
        renderTickets(allTickets);
    } else {
        const filtered = allTickets.filter(t => t.status === status);
        renderTickets(filtered);
    }
}

async function cancelTicket(ticketId) {
    if (!confirm('Are you sure you want to cancel this ticket?')) return;

    try {
        const response = await apiRequest(`/tickets/${ticketId}`, {
            method: 'DELETE'
        });

        if (response.status === 'success') {
            showToast('Ticket cancelled successfully', 'success');
            loadUserTickets();
        }
    } catch (error) {
        showToast(error.message || 'Failed to cancel ticket', 'error');
    }
}

async function confirmTicket(ticketId) {
    try {
        const response = await apiRequest(`/tickets/${ticketId}/confirm`, {
            method: 'POST'
        });

        if (response.status === 'success') {
            showToast('Ticket confirmed successfully!', 'success');
            loadUserTickets();
        }
    } catch (error) {
        showToast(error.message || 'Failed to confirm ticket', 'error');
    }
}

async function purchaseTicket(matchTitle, matchDate, category, price) {
    try {
        const response = await apiRequest('/tickets', {
            method: 'POST',
            body: JSON.stringify({
                match_title: matchTitle,
                match_date: matchDate,
                category: category,
                price: price,
                seat_number: generateSeatNumber()
            })
        });

        if (response.status === 'success') {
            showToast('Ticket purchased successfully!', 'success');
            loadUserTickets();
            return response.data;
        }
    } catch (error) {
        showToast(error.message || 'Failed to purchase ticket', 'error');
    }
}

function generateSeatNumber() {
    const sections = ['A', 'B', 'C', 'D'];
    const section = sections[Math.floor(Math.random() * sections.length)];
    const row = Math.floor(Math.random() * 50) + 1;
    const seat = Math.floor(Math.random() * 30) + 1;
    return `${section}${row}-${seat}`;
}

// ============================================
// Matches
// ============================================
async function loadUpcomingMatches() {
    const loadingEl = document.getElementById('matches-loading');
    const gridEl = document.getElementById('matches-grid');

    try {
        // Try backend proxy first
        const response = await apiRequest(`/football/teams/${TEAM_ID}/matches?status=SCHEDULED&limit=6`);
        if (response.status === 'success' && response.data.matches) {
            renderMatches(response.data.matches);
        } else {
            throw new Error('No matches');
        }
    } catch (error) {
        console.log('Backend proxy failed, trying direct API...');
        try {
            const directResponse = await fetch(`/football-api/v4/teams/${TEAM_ID}/matches?status=SCHEDULED&limit=6`);
            const data = await directResponse.json();
            if (data.matches) {
                renderMatches(data.matches);
            } else {
                renderFallbackMatches();
            }
        } catch (e) {
            renderFallbackMatches();
        }
    }
}

function renderMatches(matches) {
    const loadingEl = document.getElementById('matches-loading');
    const gridEl = document.getElementById('matches-grid');

    loadingEl.classList.add('hidden');
    gridEl.classList.remove('hidden');

    if (matches.length === 0) {
        gridEl.innerHTML = '<p class="text-center text-gray-600 col-span-full py-8">No upcoming matches scheduled.</p>';
        return;
    }

    gridEl.innerHTML = matches.map(match => {
        const matchDate = new Date(match.utcDate);
        const dateStr = matchDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
        const timeStr = matchDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div class="gradient-bg p-4 text-white text-center">
                    <span class="text-xs uppercase tracking-wider">${match.competition.name}</span>
                </div>
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="text-center flex-1">
                            <p class="font-bold text-lg truncate" title="${match.homeTeam.name}">${match.homeTeam.shortName || match.homeTeam.name}</p>
                            <p class="text-xs text-gray-500">HOME</p>
                        </div>
                        <div class="px-4 text-2xl font-bold text-gray-300">VS</div>
                        <div class="text-center flex-1">
                            <p class="font-bold text-lg truncate" title="${match.awayTeam.name}">${match.awayTeam.shortName || match.awayTeam.name}</p>
                            <p class="text-xs text-gray-500">AWAY</p>
                        </div>
                    </div>
                    <div class="text-center mb-4 pb-4 border-b border-gray-100">
                        <p class="text-blue-900 font-bold">${dateStr}</p>
                        <p class="text-gray-600 text-sm">${timeStr}</p>
                    </div>
                    <button onclick="showBuyTicketModal('${match.homeTeam.name} vs ${match.awayTeam.name}', '${match.utcDate}')" 
                            class="w-full gradient-bg text-white py-3 rounded-lg font-bold hover:opacity-90 transition">
                        <i class="fas fa-ticket-alt mr-2"></i> Buy Ticket
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderFallbackMatches() {
    const fallbackMatches = [
        { utcDate: new Date(Date.now() + 86400000 * 3).toISOString(), homeTeam: { name: 'FC Barcelona', shortName: 'Barcelona' }, awayTeam: { name: 'Real Madrid', shortName: 'Real Madrid' }, competition: { name: 'La Liga' } },
        { utcDate: new Date(Date.now() + 86400000 * 7).toISOString(), homeTeam: { name: 'Atletico Madrid', shortName: 'Atletico' }, awayTeam: { name: 'FC Barcelona', shortName: 'Barcelona' }, competition: { name: 'La Liga' } },
        { utcDate: new Date(Date.now() + 86400000 * 14).toISOString(), homeTeam: { name: 'FC Barcelona', shortName: 'Barcelona' }, awayTeam: { name: 'Bayern Munich', shortName: 'Bayern' }, competition: { name: 'Champions League' } },
    ];
    renderMatches(fallbackMatches);
}

// ============================================
// Modal & UI Helpers
// ============================================
function showBuyTicketModal(matchTitle, matchDate) {
    document.getElementById('buy-match-title').textContent = matchTitle;
    document.getElementById('buy-match-date').value = matchDate;
    document.getElementById('ticket-category').value = 'regular';
    updatePriceDisplay();
    openModal('buyTicketModal');
}

function updatePriceDisplay() {
    const select = document.getElementById('ticket-category');
    const option = select.options[select.selectedIndex];
    const price = parseInt(option.dataset.price);
    document.getElementById('total-price').textContent = `Rp ${formatPrice(price)}`;
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('hidden');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// Form Handlers
// ============================================
function handleLoginSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;
    login(email, password);
}

function handleRegisterSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('[name="name"]').value;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;
    const passwordConfirmation = form.querySelector('[name="password_confirmation"]').value;
    register(name, email, password, passwordConfirmation);
}

function handleBuyTicketSubmit(event) {
    event.preventDefault();
    const matchTitle = document.getElementById('buy-match-title').textContent;
    const matchDate = document.getElementById('buy-match-date').value;
    const select = document.getElementById('ticket-category');
    const category = select.value;
    const price = parseInt(select.options[select.selectedIndex].dataset.price);
    
    purchaseTicket(matchTitle, matchDate, category, price);
    closeModal('buyTicketModal');
}

// ============================================
// Utility Functions
// ============================================
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('id-ID').format(price);
}

function getTicketBorderColor(status) {
    const colors = {
        pending: 'bg-yellow-500',
        active: 'bg-green-500',
        used: 'bg-gray-400',
        cancelled: 'bg-red-500',
        expired: 'bg-gray-300'
    };
    return colors[status] || 'bg-gray-300';
}

function getStatusBadge(status) {
    const badges = {
        pending: 'bg-yellow-100 text-yellow-800',
        active: 'bg-green-100 text-green-800',
        used: 'bg-gray-100 text-gray-800',
        cancelled: 'bg-red-100 text-red-800',
        expired: 'bg-gray-100 text-gray-500'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
}
