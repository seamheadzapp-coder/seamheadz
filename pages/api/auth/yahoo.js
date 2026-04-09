export default function handler(req, res) {
  const clientId = 'dj0yJmk9b3luZWl3Qm1GSjBPJmQ9WVdrOU9WVkJXbFl3Um1RbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTI2'
  const redirectUri = 'https://seamheadz.vercel.app/api/auth/callback'

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    language: 'en-us',
  })

  res.redirect(`https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}`)
}
