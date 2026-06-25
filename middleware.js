/* ============================================================
   linq labs — Auth gate (Vercel Edge Middleware)
   Requires a valid Google session for every page. Anyone with a
   verified @linqapp.com Google account can sign in; everyone else
   is redirected to Google and then bounced if their domain doesn't
   match. The /api/auth/* endpoints and static assets are exempt.
   ============================================================ */

import { SESSION_COOKIE, verifySession, readCookie, env } from './lib/auth.js';

export const config = {
  // Protect every route EXCEPT the auth endpoints, Vercel internals,
  // and static asset file types. Clean URLs (no extension) and .html
  // are NOT excluded, so all lesson pages stay gated.
  matcher: [
    '/((?!api/auth|_vercel|.*\\.(?:css|js|mjs|map|svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|otf|txt|xml|json)$).*)'
  ]
};

export default async function middleware(request) {
  var secret = env('AUTH_SECRET');
  var url = new URL(request.url);

  var token = readCookie(request, SESSION_COOKIE);
  var session = await verifySession(secret, token);

  if (session && session.email) {
    return; // authenticated — let the request through
  }

  // Not signed in → start the Google login flow, remembering the target
  var loginUrl = new URL('/api/auth/login', url.origin);
  loginUrl.searchParams.set('returnTo', url.pathname + url.search);
  return Response.redirect(loginUrl.toString(), 302);
}
