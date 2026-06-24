/* Handles Google's redirect: exchanges the code, checks the email
   domain, and sets the signed session cookie. */

import { SESSION_COOKIE, STATE_COOKIE, SESSION_TTL_SECONDS, signSession, readCookie } from '../../lib/auth.js';

export const config = { runtime: 'edge' };

function deny(message) {
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Access denied — linq labs</title>' +
    '<style>body{font-family:-apple-system,system-ui,sans-serif;background:#0a0a0a;color:#fff;' +
    'display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}' +
    '.box{max-width:420px;padding:32px}h1{font-size:1.3rem;margin:0 0 12px}' +
    'p{color:#888;line-height:1.6;margin:0 0 20px}a{color:#60a5fa;text-decoration:none}</style></head>' +
    '<body><div class="box"><h1>Access denied</h1><p>' + message + '</p>' +
    '<p><a href="/api/auth/login">Try a different account →</a></p></div></body></html>';
  return new Response(html, { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function decodeJwtPayload(idToken) {
  var part = idToken.split('.')[1];
  part = part.replace(/-/g, '+').replace(/_/g, '/');
  while (part.length % 4) part += '=';
  return JSON.parse(atob(part));
}

export default async function handler(request) {
  var url = new URL(request.url);
  var code = url.searchParams.get('code');
  var state = url.searchParams.get('state');
  var allowedDomain = process.env.ALLOWED_HD || 'linqapp.com';

  if (!code || !state) return deny('Missing authorization code.');

  // Verify CSRF state against the cookie set at /login
  var stateObj;
  try {
    var raw = state.replace(/-/g, '+').replace(/_/g, '/');
    while (raw.length % 4) raw += '=';
    stateObj = JSON.parse(atob(raw));
  } catch (e) {
    return deny('Invalid sign-in state. Please try again.');
  }
  var cookieNonce = readCookie(request, STATE_COOKIE);
  if (!cookieNonce || cookieNonce !== stateObj.n) {
    return deny('Sign-in state did not match. Please try again.');
  }

  // Exchange the code for tokens (server-to-server, over TLS)
  var tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: url.origin + '/api/auth/callback',
      grant_type: 'authorization_code'
    })
  });
  if (!tokenRes.ok) return deny('Could not complete sign-in with Google.');

  var tokens = await tokenRes.json();
  if (!tokens.id_token) return deny('Google did not return an identity token.');

  var claims;
  try { claims = decodeJwtPayload(tokens.id_token); } catch (e) { return deny('Could not read Google identity.'); }

  var email = (claims.email || '').toLowerCase();
  var verified = claims.email_verified === true || claims.email_verified === 'true';
  var domain = email.indexOf('@') !== -1 ? email.split('@')[1] : '';

  if (!verified || domain !== allowedDomain.toLowerCase()) {
    return deny('Access is limited to @' + allowedDomain + ' accounts. You signed in as ' + (email || 'an unknown account') + '.');
  }

  // Issue the session cookie
  var exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  var sessionToken = await signSession(process.env.AUTH_SECRET, { email: email, exp: exp });

  var returnTo = (stateObj.r && typeof stateObj.r === 'string' && stateObj.r.charAt(0) === '/') ? stateObj.r : '/';

  var headers = new Headers();
  headers.append('Set-Cookie',
    SESSION_COOKIE + '=' + sessionToken + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + SESSION_TTL_SECONDS);
  headers.append('Set-Cookie',
    STATE_COOKIE + '=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  headers.set('Location', returnTo);
  return new Response(null, { status: 302, headers: headers });
}
