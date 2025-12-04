document.addEventListener('DOMContentLoaded', () => {
    const matchesList = document.getElementById('matches-list');
    const API_KEY = import.meta.env.VITE_API_KEY; 
    const TEAM_ID = 81; // FC Barcelona
    
    // Using a CORS proxy to bypass browser restrictions
    // If this fails, we fall back to mock data
    const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
    const BASE_URL = `https://api.football-data.org/v4/teams/${TEAM_ID}/matches?status=SCHEDULED&limit=3`;
    const API_URL = PROXY_URL + BASE_URL;

    async function fetchMatches() {
        try {
            console.log('Fetching matches...');
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'X-Auth-Token': API_KEY
                }
            });

            if (!response.ok) {
                // If 403 or 429, it might be the proxy needing activation or rate limits
                if (response.status === 403) {
                    console.warn('CORS Proxy might require activation. Visit https://cors-anywhere.herokuapp.com/corsdemo');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            renderMatches(data.matches);
        } catch (error) {
            console.error('Error fetching matches:', error);
            console.log('Falling back to mock data...');
            renderMockData();
        }
    }

    function renderMockData() {
        // Fallback data in case API fails (common with free tier CORS issues)
        const mockMatches = [
            {
                utcDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                homeTeam: { name: 'FC Barcelona' },
                awayTeam: { name: 'Real Madrid' },
                competition: { name: 'La Liga' }
            },
            {
                utcDate: new Date(Date.now() + 604800000).toISOString(), // Next week
                homeTeam: { name: 'Girona FC' },
                awayTeam: { name: 'FC Barcelona' },
                competition: { name: 'La Liga' }
            },
            {
                utcDate: new Date(Date.now() + 1209600000).toISOString(), // 2 weeks
                homeTeam: { name: 'FC Barcelona' },
                awayTeam: { name: 'Bayern Munich' },
                competition: { name: 'UEFA Champions League' }
            }
        ];
        
        matchesList.innerHTML = `
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 mx-auto max-w-4xl">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-yellow-700">
                            Note: Displaying mock data because the API connection was blocked (likely CORS). 
                            To fix, visit <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank" class="font-bold underline">this link</a> to enable the demo server temporarily.
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Append mock matches after the warning
        const container = document.createElement('div');
        container.className = 'space-y-4';
        matchesList.appendChild(container);
        
        // Temporarily re-point matchesList to the new container for the render function
        const originalMatchesList = matchesList;
        // We can't easily reuse renderMatches without refactoring, so let's just manually render here or refactor renderMatches.
        // Let's refactor renderMatches to take a container.
        // Actually, easier to just reuse the logic.
        
        mockMatches.forEach(match => {
             const matchDate = new Date(match.utcDate);
            const dateString = matchDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
            const timeString = matchDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

            const matchElement = document.createElement('div');
            matchElement.className = 'bg-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center hover-scale transition duration-300';
            
            matchElement.innerHTML = `
                <div class="flex items-center space-x-4 mb-4 md:mb-0 w-full md:w-auto justify-center md:justify-start">
                    <div class="text-center w-32">
                        <div class="font-bold text-lg truncate" title="${match.homeTeam.name}">${match.homeTeam.name}</div>
                        <div class="text-gray-500 text-sm">Home</div>
                    </div>
                    <div class="text-2xl font-bold text-gray-400 px-4">VS</div>
                    <div class="text-center w-32">
                        <div class="font-bold text-lg truncate" title="${match.awayTeam.name}">${match.awayTeam.name}</div>
                        <div class="text-gray-500 text-sm">Away</div>
                    </div>
                </div>
                <div class="text-center border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-8 mt-4 md:mt-0 w-full md:w-auto">
                    <div class="text-blue-900 font-bold text-lg">${dateString}</div>
                    <div class="text-gray-600">${timeString}</div>
                    <div class="text-xs text-gray-400 mt-1 uppercase">${match.competition.name}</div>
                </div>
            `;
            container.appendChild(matchElement);
        });
    }

    // Function to render matches to the DOM
    function renderMatches(matches) {
        matchesList.innerHTML = ''; // Clear loading state

        if (matches.length === 0) {
            matchesList.innerHTML = '<p class="text-center text-gray-600">No upcoming matches scheduled.</p>';
            return;
        }

        matches.forEach(match => {
            const matchDate = new Date(match.utcDate);
            const dateString = matchDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
            const timeString = matchDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

            const matchElement = document.createElement('div');
            matchElement.className = 'bg-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center hover-scale transition duration-300';
            
            matchElement.innerHTML = `
                <div class="flex items-center space-x-4 mb-4 md:mb-0 w-full md:w-auto justify-center md:justify-start">
                    <div class="text-center w-32">
                        <div class="font-bold text-lg truncate" title="${match.homeTeam.name}">${match.homeTeam.name}</div>
                        <div class="text-gray-500 text-sm">Home</div>
                    </div>
                    <div class="text-2xl font-bold text-gray-400 px-4">VS</div>
                    <div class="text-center w-32">
                        <div class="font-bold text-lg truncate" title="${match.awayTeam.name}">${match.awayTeam.name}</div>
                        <div class="text-gray-500 text-sm">Away</div>
                    </div>
                </div>
                <div class="text-center border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-8 mt-4 md:mt-0 w-full md:w-auto">
                    <div class="text-blue-900 font-bold text-lg">${dateString}</div>
                    <div class="text-gray-600">${timeString}</div>
                    <div class="text-xs text-gray-400 mt-1 uppercase">${match.competition.name}</div>
                </div>
            `;

            matchesList.appendChild(matchElement);
        });
    }

    // Initial fetch
    fetchMatches();
});
