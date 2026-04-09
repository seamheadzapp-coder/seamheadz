export default function handler(req, res) {
  const clientId = process.env.YAHOO_CLIENT_ID
  const redirectUri = 'https://seamheadz.vercel.app/api/auth/callback'

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    language: 'en-us',
  })

  res.redirect(`https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}`)
}
