export default async function handler(req, res) {
  const accessToken = req.cookies?.yahoo_access_token

  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated with Yahoo', needsAuth: true })
  }

  try {
    const gamesRes = await fetch(
      'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_codes=mlb/leagues?format=json',
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    )

    if (!gamesRes.ok) {
      return res.status(401).json({ error: 'Yahoo token expired', needsAuth: true })
    }

    const data = await gamesRes.json()
    const games = data?.fantasy_content?.users?.[0]?.user?.[1]?.games

    if (!games) {
      return res.json({ leagues: [] })
    }

    const leagues = []
    const gameCount = games.count || 0

    for (let i = 0; i < gameCount; i++) {
      const game = games[i]?.game
      if (!game) continue
      const gameLeagues = game[1]?.leagues
      if (!gameLeagues) continue
      const leagueCount = gameLeagues.count || 0

      for (let j = 0; j < leagueCount; j++) {
        const league = gameLeagues[j]?.league?.[0]
        if (!league) continue
        leagues.push({
          leagueKey: league.league_key,
          leagueId: league.league_id,
          name: league.name,
          season: league.season,
          numTeams: league.num_teams,
        })
      }
    }

    res.json({ leagues })
  } catch (err) {
    console.error('Yahoo leagues error:', err)
    res.status(500).json({ error: 'Failed to fetch leagues', details: err.message })
  }
}
