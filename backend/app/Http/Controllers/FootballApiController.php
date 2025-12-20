<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class FootballApiController extends Controller
{
    protected $baseUrl;
    protected $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.football.url', 'https://api.football-data.org/v4');
        $this->apiKey = config('services.football.key', env('FOOTBALL_API_KEY'));
    }

    /**
     * Make a request to the football-data.org API
     */
    protected function makeApiRequest(string $endpoint, array $params = [])
    {
        $cacheKey = 'football_' . md5($endpoint . json_encode($params));
        $cacheTTL = 300; // 5 minutes cache

        return Cache::remember($cacheKey, $cacheTTL, function () use ($endpoint, $params) {
            $response = Http::withHeaders([
                'X-Auth-Token' => $this->apiKey,
            ])->get($this->baseUrl . $endpoint, $params);

            if ($response->failed()) {
                return [
                    'error' => true,
                    'message' => 'Failed to fetch data from football API',
                    'status' => $response->status()
                ];
            }

            return $response->json();
        });
    }

    /**
     * Get team details
     */
    public function getTeam(string $teamId)
    {
        $data = $this->makeApiRequest("/teams/{$teamId}");

        if (isset($data['error'])) {
            return response()->json([
                'status' => 'error',
                'message' => $data['message']
            ], $data['status'] ?? 500);
        }

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Get team squad (players)
     */
    public function getPlayers(string $teamId)
    {
        $data = $this->makeApiRequest("/teams/{$teamId}");

        if (isset($data['error'])) {
            return response()->json([
                'status' => 'error',
                'message' => $data['message']
            ], $data['status'] ?? 500);
        }

        // Extract squad from team data
        $squad = $data['squad'] ?? [];

        return response()->json([
            'status' => 'success',
            'data' => [
                'team' => [
                    'id' => $data['id'] ?? null,
                    'name' => $data['name'] ?? null,
                    'crest' => $data['crest'] ?? null,
                ],
                'players' => $squad
            ]
        ]);
    }

    /**
     * Get single player details
     */
    public function getPlayer(string $playerId)
    {
        $data = $this->makeApiRequest("/persons/{$playerId}");

        if (isset($data['error'])) {
            return response()->json([
                'status' => 'error',
                'message' => $data['message']
            ], $data['status'] ?? 500);
        }

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Get team matches
     */
    public function getMatches(Request $request, string $teamId)
    {
        $params = [];

        if ($request->has('status')) {
            $params['status'] = $request->status; // SCHEDULED, LIVE, IN_PLAY, FINISHED, etc.
        }

        if ($request->has('limit')) {
            $params['limit'] = min($request->limit, 50);
        }

        if ($request->has('dateFrom')) {
            $params['dateFrom'] = $request->dateFrom;
        }

        if ($request->has('dateTo')) {
            $params['dateTo'] = $request->dateTo;
        }

        $data = $this->makeApiRequest("/teams/{$teamId}/matches", $params);

        if (isset($data['error'])) {
            return response()->json([
                'status' => 'error',
                'message' => $data['message']
            ], $data['status'] ?? 500);
        }

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Get available competitions
     */
    public function getCompetitions()
    {
        $data = $this->makeApiRequest('/competitions');

        if (isset($data['error'])) {
            return response()->json([
                'status' => 'error',
                'message' => $data['message']
            ], $data['status'] ?? 500);
        }

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Get competition standings
     */
    public function getStandings(string $competitionId)
    {
        $data = $this->makeApiRequest("/competitions/{$competitionId}/standings");

        if (isset($data['error'])) {
            return response()->json([
                'status' => 'error',
                'message' => $data['message']
            ], $data['status'] ?? 500);
        }

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Get competition scorers
     */
    public function getScorers(string $competitionId)
    {
        $data = $this->makeApiRequest("/competitions/{$competitionId}/scorers");

        if (isset($data['error'])) {
            return response()->json([
                'status' => 'error',
                'message' => $data['message']
            ], $data['status'] ?? 500);
        }

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Search for teams
     */
    public function searchTeams(Request $request)
    {
        $params = [];

        if ($request->has('name')) {
            $params['name'] = $request->name;
        }

        $data = $this->makeApiRequest('/teams', $params);

        if (isset($data['error'])) {
            return response()->json([
                'status' => 'error',
                'message' => $data['message']
            ], $data['status'] ?? 500);
        }

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Get news from FC Barcelona RSS feed
     */
    public function getNews(Request $request)
    {
        $cacheKey = 'fcb_news_rss';
        $cacheTTL = 900; // 15 minutes cache

        $news = Cache::remember($cacheKey, $cacheTTL, function () {
            try {
                // FC Barcelona official RSS feed
                $rssUrl = 'https://www.fcbarcelona.com/en/rss/index.rss';
                
                $response = Http::timeout(10)->get($rssUrl);
                
                if ($response->failed()) {
                    return $this->getFallbackNews();
                }

                $xml = simplexml_load_string($response->body());
                
                if (!$xml || !isset($xml->channel->item)) {
                    return $this->getFallbackNews();
                }

                $articles = [];
                $count = 0;
                
                foreach ($xml->channel->item as $item) {
                    if ($count >= 6) break; // Limit to 6 articles
                    
                    // Extract image from content or media
                    $image = null;
                    $namespaces = $item->getNamespaces(true);
                    
                    if (isset($namespaces['media'])) {
                        $media = $item->children($namespaces['media']);
                        if (isset($media->content)) {
                            $image = (string) $media->content->attributes()->url;
                        }
                    }
                    
                    // Parse description for image if not found
                    if (!$image) {
                        $desc = (string) $item->description;
                        preg_match('/<img[^>]+src=["\']([^"\']+)["\']/', $desc, $matches);
                        if (!empty($matches[1])) {
                            $image = $matches[1];
                        }
                    }

                    $articles[] = [
                        'title' => (string) $item->title,
                        'description' => strip_tags((string) $item->description),
                        'link' => (string) $item->link,
                        'pubDate' => (string) $item->pubDate,
                        'image' => $image,
                        'category' => (string) ($item->category ?? 'News')
                    ];
                    
                    $count++;
                }

                return $articles;
            } catch (\Exception $e) {
                return $this->getFallbackNews();
            }
        });

        return response()->json([
            'status' => 'success',
            'data' => $news
        ]);
    }

    /**
     * Fallback news when RSS fails
     */
    protected function getFallbackNews()
    {
        return [
            [
                'title' => 'FC Barcelona Latest News',
                'description' => 'Stay tuned for the latest updates from FC Barcelona. Check our official website for more information.',
                'link' => 'https://www.fcbarcelona.com/en/news',
                'pubDate' => date('D, d M Y H:i:s O'),
                'image' => null,
                'category' => 'News'
            ],
            [
                'title' => 'Match Preview',
                'description' => 'Get ready for our upcoming matches. Buy your tickets now and support the team!',
                'link' => 'https://www.fcbarcelona.com/en/football/first-team',
                'pubDate' => date('D, d M Y H:i:s O', strtotime('-1 day')),
                'image' => null,
                'category' => 'Football'
            ],
            [
                'title' => 'La Masia Update',
                'description' => 'Discover the young talents coming through our famous academy.',
                'link' => 'https://www.fcbarcelona.com/en/football/la-masia',
                'pubDate' => date('D, d M Y H:i:s O', strtotime('-2 days')),
                'image' => null,
                'category' => 'Academy'
            ]
        ];
    }
}
