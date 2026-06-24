/* ============================================================
   linq labs — Session signing/verification
   Signs a small session payload with HMAC-SHA256 using the
   built-in Web Crypto API (no npm dependencies, runs on the
   Vercel Edge runtime). Shared by middleware.js (verify) and
   api/auth/callback.js (sign).
   ============================================================ */

const enc = new TextEncoder();

export const SESSION_COOKIE = '__ll_session';
export const STATE_COOKIE = '__ll_oauth_state';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/* --- base64url helpers --- */
function bytesToB64url(bytes) {
  var bin = '';
  for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  var bin = atob(s);
  var out = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function b64urlEncodeString(str) {
  return bytesToB64url(enc.encode(str));
}

export function b64urlDecodeString(s) {
  return new TextDecoder().decode(b64urlToBytes(s));
}

/* --- HMAC --- */
async function hmac(secret, data) {
  var key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  var sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return bytesToB64url(new Uint8Array(sig));
}

/* Create a signed token: "<payloadB64url>.<sigB64url>" */
export async function signSession(secret, payloadObj) {
  var payload = b64urlEncodeString(JSON.stringify(payloadObj));
  var sig = await hmac(secret, payload);
  return payload + '.' + sig;
}

/* Verify a token; return the payload object, or null if invalid/expired */
export async function verifySession(secret, token) {
  if (!secret || !token || token.indexOf('.') === -1) return null;
  var parts = token.split('.');
  var payload = parts[0];
  var sig = parts[1];
  var expected = await hmac(secret, payload);

  // length-safe constant-time-ish comparison
  if (sig.length !== expected.length) return null;
  var diff = 0;
  for (var i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;

  var obj;
  try { obj = JSON.parse(b64urlDecodeString(payload)); } catch (e) { return null; }
  if (!obj || typeof obj.exp !== 'number') return null;
  if (obj.exp < Math.floor(Date.now() / 1000)) return null;
  return obj;
}

/* Read a single cookie value off a Request (no NextRequest dependency) */
export function readCookie(request, name) {
  var header = request.headers.get('cookie') || '';
  var parts = header.split(';');
  for (var i = 0; i < parts.length; i++) {
    var idx = parts[i].indexOf('=');
    if (idx === -1) continue;
    var k = parts[i].slice(0, idx).trim();
    if (k === name) return decodeURIComponent(parts[i].slice(idx + 1).trim());
  }
  return null;
}
