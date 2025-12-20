// Landing Page JavaScript
// API Configuration
const API_BASE_URL = '/api';
const TEAM_ID = 81; // FC Barcelona

// Auth State
let authToken = localStorage.getItem('auth_token');
let currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    fetchMatches();
    fetchNews();
    initScrollReveal();
    
    // Make functions globally available
    window.toggleMenu = toggleMenu;
    window.login = login;
    window.logout = logout;
    window.register = register;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.handleLoginSubmit = handleLoginSubmit;
    window.handleRegisterSubmit = handleRegisterSubmit;

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    document.getElementById('mobileMenu')?.classList.add('hidden');
                }
            }
        });
    });

    // Add scroll effect to header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.classList.add('bg-opacity-95', 'shadow-lg');
        } else {
            header.classList.remove('bg-opacity-95', 'shadow-lg');
        }
    });
});

// ============================================
// Scroll Reveal
// ============================================
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all scroll-reveal elements
    document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale').forEach(el => {
        observer.observe(el);
    });

    // Add scroll-reveal class to sections
    document.querySelectorAll('section').forEach((section, index) => {
        if (!section.classList.contains('scroll-reveal')) {
            section.querySelectorAll('h2, p, .grid > *, article').forEach((child, childIndex) => {
                child.classList.add('scroll-reveal');
                child.style.transitionDelay = `${childIndex * 0.1}s`;
                observer.observe(child);
            });
        }
    });
}

// ============================================
// News Fetching
// ============================================
async function fetchNews() {
    const newsContainer = document.querySelector('#news .grid');
    if (!newsContainer) return;

    try {
        const response = await fetch(`${API_BASE_URL}/news`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
            renderNews(data.data);
        } else {
            console.log('News API failed, keeping static content');
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        // Keep the existing static news content
    }
}

function renderNews(articles) {
    const newsContainer = document.querySelector('#news .grid');
    if (!newsContainer || articles.length === 0) return;

    newsContainer.innerHTML = articles.slice(0, 3).map((article, index) => {
        const pubDate = article.pubDate ? formatNewsDate(article.pubDate) : 'Today';
        const category = article.category || 'News';
        const icons = ['📰', '⚽', '🏟️', '🌟', '🎉', '📣'];
        const icon = icons[index % icons.length];

        return `
            <article class="news-card bg-white rounded-xl shadow-lg overflow-hidden scroll-reveal" style="transition-delay: ${index * 0.15}s">
                <div class="relative h-48 overflow-hidden">
                    ${article.image 
                        ? `<img src="${article.image}" alt="${article.title}" class="news-image w-full h-full object-cover" onerror="this.parentElement.innerHTML='<div class=\\'gradient-bg w-full h-full flex items-center justify-center\\'><span class=\\'text-4xl\\'>${icon}</span></div>'">`
                        : `<div class="gradient-bg w-full h-full flex items-center justify-center">
                            <span class="text-white text-4xl">${icon}</span>
                           </div>`
                    }
                    <div class="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-blue-900">
                        ${category}
                    </div>
                </div>
                <div class="p-6">
                    <div class="text-sm text-blue-900 mb-2 flex items-center">
                        <i class="far fa-clock mr-2"></i>${pubDate}
                    </div>
                    <h3 class="text-xl font-bold mb-3 line-clamp-2" title="${article.title}">${article.title}</h3>
                    <p class="text-gray-600 mb-4 line-clamp-3">${truncateText(article.description, 120)}</p>
                    <a href="${article.link}" target="_blank" rel="noopener noreferrer" 
                       class="inline-flex items-center text-blue-900 font-semibold hover:text-red-700 transition group">
                        Read More 
                        <i class="fas fa-arrow-right ml-2 transform group-hover:translate-x-1 transition"></i>
                    </a>
                </div>
            </article>
        `;
    }).join('');

    // Re-observe new elements
    initScrollReveal();
}

function formatNewsDate(dateStr) {
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return 'Recently';
    }
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
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
            updateAuthUI();
            showToast('Registration successful! Redirecting to dashboard...', 'success');
            closeModal('registerModal');
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
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
            updateAuthUI();
            showToast('Login successful! Redirecting to dashboard...', 'success');
            closeModal('loginModal');
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
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
        updateAuthUI();
        showToast('Logged out successfully', 'success');
    }
}

// ============================================
// Matches
// ============================================
async function fetchMatches() {
    const matchesList = document.getElementById('matches-list');
    if (!matchesList) return;

    try {
        // Try via Vite proxy first
        const response = await fetch(`/football-api/v4/teams/${TEAM_ID}/matches?status=SCHEDULED&limit=3`);
        if (!response.ok) throw new Error('API failed');
        const data = await response.json();
        renderMatches(data.matches);
    } catch (error) {
        console.error('Error fetching matches:', error);
        renderFallbackMatches();
    }
}

function renderMatches(matches) {
    const matchesList = document.getElementById('matches-list');
    if (!matchesList) return;
    
    matchesList.innerHTML = '';

    if (!matches || matches.length === 0) {
        matchesList.innerHTML = '<p class="text-center text-gray-600">No upcoming matches scheduled.</p>';
        return;
    }

    matches.forEach(match => {
        const matchDate = new Date(match.utcDate);
        const dateString = matchDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
        const timeString = matchDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        
        // Get team crests or use fallback
        const homeCrest = match.homeTeam.crest || '';
        const awayCrest = match.awayTeam.crest || '';
        const homeInitial = match.homeTeam.shortName?.charAt(0) || match.homeTeam.name.charAt(0);
        const awayInitial = match.awayTeam.shortName?.charAt(0) || match.awayTeam.name.charAt(0);

        const matchElement = document.createElement('div');
        matchElement.className = 'bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1';
        
        matchElement.innerHTML = `
            <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                <!-- Teams -->
                <div class="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-center">
                    <!-- Home Team -->
                    <div class="text-center flex-1 md:flex-none md:w-36">
                        <div class="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-md">
                            ${homeCrest 
                                ? `<img src="${homeCrest}" alt="${match.homeTeam.name}" class="w-12 h-12 object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                   <span class="text-2xl font-bold text-gray-400 hidden">${homeInitial}</span>`
                                : `<span class="text-2xl font-bold text-gray-400">${homeInitial}</span>`
                            }
                        </div>
                        <div class="font-bold text-sm md:text-base truncate" title="${match.homeTeam.name}">${match.homeTeam.shortName || match.homeTeam.name}</div>
                        <div class="text-gray-500 text-xs">HOME</div>
                    </div>
                    
                    <!-- VS Badge -->
                    <div class="flex flex-col items-center">
                        <div class="w-12 h-12 rounded-full gradient-bg flex items-center justify-center shadow-lg">
                            <span class="text-white font-bold text-sm">VS</span>
                        </div>
                    </div>
                    
                    <!-- Away Team -->
                    <div class="text-center flex-1 md:flex-none md:w-36">
                        <div class="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-md">
                            ${awayCrest 
                                ? `<img src="${awayCrest}" alt="${match.awayTeam.name}" class="w-12 h-12 object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                   <span class="text-2xl font-bold text-gray-400 hidden">${awayInitial}</span>`
                                : `<span class="text-2xl font-bold text-gray-400">${awayInitial}</span>`
                            }
                        </div>
                        <div class="font-bold text-sm md:text-base truncate" title="${match.awayTeam.name}">${match.awayTeam.shortName || match.awayTeam.name}</div>
                        <div class="text-gray-500 text-xs">AWAY</div>
                    </div>
                </div>
                
                <!-- Match Info & CTA -->
                <div class="flex flex-col sm:flex-row items-center gap-4 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
                    <div class="text-center">
                        <div class="text-blue-900 font-bold">${dateString}</div>
                        <div class="text-gray-600 text-sm">${timeString}</div>
                        <div class="text-xs text-gray-400 mt-1 uppercase">${match.competition.name}</div>
                    </div>
                    <a href="dashboard.html#purchase" class="gradient-bg text-white px-5 py-2.5 rounded-full font-bold hover:opacity-90 transition text-sm shadow-md hover:shadow-lg">
                        <i class="fas fa-ticket-alt mr-1"></i> Buy Ticket
                    </a>
                </div>
            </div>
        `;

        matchesList.appendChild(matchElement);
    });
}

function renderFallbackMatches() {
    const fallbackMatches = [
        { utcDate: new Date(Date.now() + 86400000).toISOString(), homeTeam: { name: 'FC Barcelona' }, awayTeam: { name: 'Real Madrid' }, competition: { name: 'La Liga' } },
        { utcDate: new Date(Date.now() + 604800000).toISOString(), homeTeam: { name: 'Girona FC' }, awayTeam: { name: 'FC Barcelona' }, competition: { name: 'La Liga' } },
        { utcDate: new Date(Date.now() + 1209600000).toISOString(), homeTeam: { name: 'FC Barcelona' }, awayTeam: { name: 'Bayern Munich' }, competition: { name: 'UEFA Champions League' } }
    ];
    
    const matchesList = document.getElementById('matches-list');
    if (matchesList) {
        matchesList.innerHTML = `
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 mx-auto max-w-4xl">
                <p class="text-sm text-yellow-700">Unable to fetch live data. Displaying sample matches.</p>
            </div>
        `;
        const container = document.createElement('div');
        container.className = 'space-y-4';
        matchesList.appendChild(container);
        fallbackMatches.forEach(match => {
            const matchDate = new Date(match.utcDate);
            const dateString = matchDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
            const timeString = matchDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            
            const el = document.createElement('div');
            el.className = 'bg-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center hover-scale transition duration-300';
            el.innerHTML = `
                <div class="flex items-center space-x-4 mb-4 md:mb-0">
                    <div class="text-center w-32"><div class="font-bold text-lg">${match.homeTeam.name}</div><div class="text-gray-500 text-sm">Home</div></div>
                    <div class="text-2xl font-bold text-gray-400 px-4">VS</div>
                    <div class="text-center w-32"><div class="font-bold text-lg">${match.awayTeam.name}</div><div class="text-gray-500 text-sm">Away</div></div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-center border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-8">
                        <div class="text-blue-900 font-bold text-lg">${dateString}</div>
                        <div class="text-gray-600">${timeString}</div>
                        <div class="text-xs text-gray-400 mt-1 uppercase">${match.competition.name}</div>
                    </div>
                    <a href="dashboard.html#purchase" class="gradient-bg text-white px-4 py-2 rounded-full font-bold hover:opacity-90 transition text-sm">Buy Ticket</a>
                </div>
            `;
            container.appendChild(el);
        });
    }
}

// ============================================
// UI Helpers
// ============================================
function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');

    if (authToken && currentUser) {
        if (authButtons) authButtons.classList.add('hidden');
        if (userMenu) {
            userMenu.classList.remove('hidden');
            const userName = userMenu.querySelector('#user-name');
            if (userName) userName.textContent = currentUser.name;
        }
    } else {
        if (authButtons) authButtons.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
    }
}

function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('hidden');
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
