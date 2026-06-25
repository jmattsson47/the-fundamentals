/* Redirects the visitor to Google's consent screen. */

import { STATE_COOKIE, env } from '../../lib/auth.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  var url = new URL(request.url);
  var returnTo = url.searchParams.get('returnTo') || '/';

  var clientId = env('GOOGLE_CLIENT_ID');
  var allowedDomain = env('ALLOWED_HD', 'linqapp.com');
  var redirectUri = url.origin + '/api/auth/callback';

  // CSRF protection: random nonce stored in a cookie AND echoed in `state`.
  var nonce = crypto.randomUUID();
  var statePayload = btoa(JSON.stringify({ n: nonce, r: returnTo }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  var authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId || '');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', statePayload);
  authUrl.searchParams.set('hd', allowedDomain); // hint Google to the workspace
  authUrl.searchParams.set('prompt', 'select_account');

  var headers = new Headers();
  headers.append('Set-Cookie',
    STATE_COOKIE + '=' + nonce + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600');
  headers.set('Location', authUrl.toString());
  return new Response(null, { status: 302, headers: headers });
}
