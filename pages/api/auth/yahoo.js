export default function handler(req, res) {
  const clientId = process.env.YAHOO_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://seamheadz.vercel.app'}/api/auth/callback`

  const yahooAuthUrl = new URL('https://api.login.yahoo.com/oauth2/request_auth')
  yahooAuthUrl.searchParams.set('client_id', clientId)
  yahooAuthUrl.searchParams.set('redirect_uri', redirectUri)
  yahooAuthUrl.searchParams.set('response_type', 'code')
  yahooAuthUrl.searchParams.set('language', 'en-us')

  res.redirect(yahooAuthUrl.toString())
}
