document.addEventListener('DOMContentLoaded', () => {
    const matchesList = document.getElementById('matches-list');
    const TEAM_ID = 81; // FC Barcelona
    
    // Using Vite's proxy to bypass CORS
    // Requests to /football-api are forwarded to https://api.football-data.org
    const API_URL = `/football-api/v4/teams/${TEAM_ID}/matches?status=SCHEDULED&limit=3`;

    async function fetchMatches() {
        try {
            console.log('Fetching matches from football-data.org...');
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Matches fetched successfully:', data);
            renderMatches(data.matches);
        } catch (error) {
            console.error('Error fetching matches:', error);
            renderFallbackData();
        }
    }

    function renderFallbackData() {
        // Fallback data in case API fails
        const fallbackMatches = [
            {
                utcDate: new Date(Date.now() + 86400000).toISOString(),
                homeTeam: { name: 'FC Barcelona' },
                awayTeam: { name: 'Real Madrid' },
                competition: { name: 'La Liga' }
            },
            {
                utcDate: new Date(Date.now() + 604800000).toISOString(),
                homeTeam: { name: 'Girona FC' },
                awayTeam: { name: 'FC Barcelona' },
                competition: { name: 'La Liga' }
            },
            {
                utcDate: new Date(Date.now() + 1209600000).toISOString(),
                homeTeam: { name: 'FC Barcelona' },
                awayTeam: { name: 'Bayern Munich' },
                competition: { name: 'UEFA Champions League' }
            }
        ];
        
        matchesList.innerHTML = `
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 mx-auto max-w-4xl">
                <p class="text-sm text-yellow-700">
                    Unable to fetch live data. Displaying sample matches.
                </p>
            </div>
        `;
        
        const container = document.createElement('div');
        container.className = 'space-y-4';
        matchesList.appendChild(container);
        
        fallbackMatches.forEach(match => {
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

    function renderMatches(matches) {
        matchesList.innerHTML = '';

        if (!matches || matches.length === 0) {
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

    // Fetch matches on page load
    fetchMatches();
});
