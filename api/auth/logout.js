/* Clears the session cookie and bounces home (which re-triggers login). */

import { SESSION_COOKIE } from '../../lib/auth.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  var url = new URL(request.url);
  var headers = new Headers();
  headers.append('Set-Cookie',
    SESSION_COOKIE + '=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  headers.set('Location', url.origin + '/');
  return new Response(null, { status: 302, headers: headers });
}
