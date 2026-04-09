export default async function handler(req, res) {
  const accessToken = req.cookies?.yahoo_access_token

  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated with Yahoo', needsAuth: true })
  }

  const leagueKey = req.query.leagueKey || process.env.YAHOO_LEAGUE_KEY

  if (!leagueKey) {
    return res.status(400).json({ error: 'No league key provided' })
  }

  try {
    const txRes = await fetch(
      `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/transactions;types=add,drop,trade;count=100?format=json`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    )

    if (!txRes.ok) {
      const err = await txRes.text()
      return res.status(txRes.status).json({ error: 'Yahoo API error', details: err })
    }

    const data = await txRes.json()
    const transactions = data?.fantasy_content?.league?.[1]?.transactions

    if (!transactions) {
      return res.json({ transactions: [] })
    }

    const parsed = []
    const count = transactions.count || 0

    for (let i = 0; i < count; i++) {
      const tx = transactions[i]?.transaction
      if (!tx) continue

      const meta = tx[0]
      const players = tx[1]?.players

      const txData = {
        id: meta.transaction_id,
        type: meta.type,
        status: meta.status,
        timestamp: meta.timestamp,
        players: [],
      }

      if (players) {
        const playerCount = players.count || 0
        for (let j = 0; j < playerCount; j++) {
          const p = players[j]?.player
          if (!p) continue
          const playerMeta = p[0]
          const txData2 = p[1]?.transaction_data?.[0]

          txData.players.push({
            name: playerMeta.find?.(x => x.name)?.name?.full || 'Unknown',
            type: txData2?.type,
            sourceTeam: txData2?.source_team_name,
            destTeam: txData2?.destination_team_name,
          })
        }
      }

      parsed.push(txData)
    }

    res.json({ transactions: parsed })
  } catch (err) {
    console.error('Yahoo transactions error:', err)
    res.status(500).json({ error: 'Failed to fetch transactions', details: err.message })
  }
}
