export default async function handler(req, res) {
  const { code } = req.query

  if (!code) {
    return res.status(400).json({ error: 'No code provided' })
  }

  try {
    const clientId = 'dj0yJmk9b3luZWl3Qm1GSjBPJmQ9WVdrOU9WVkJXbFl3Um1RbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTI2'
    const clientSecret = 'b78b11aa61611614a63ef59789b1753fe838d301'
    const redirectUri = 'https://seamheadz.vercel.app/api/auth/callback'

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const tokenRes = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    const tokens = await tokenRes.json()

    if (tokens.error) {
      return res.status(400).json({ error: tokens.error_description })
    }

    res.setHeader('Set-Cookie', [
      `yahoo_access_token=${tokens.access_token}; Path=/; HttpOnly; Secure; Max-Age=3600`,
      `yahoo_refresh_token=${tokens.refresh_token}; Path=/; HttpOnly; Secure; Max-Age=86400`,
    ])

    res.redirect('/commissioner?yahoo=connected')
  } catch (err) {
    console.error('OAuth error:', err)
    res.status(500).json({ error: 'OAuth failed', details: err.message })
  }
}
