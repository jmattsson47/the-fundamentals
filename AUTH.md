# Auth gate — setup

linq labs is gated behind **Google sign-in**. Only verified **@linqapp.com**
accounts can view it. This is enforced by a Vercel Edge Middleware
(`middleware.js`) plus three auth endpoints in `api/auth/`.

```
visitor → middleware.js ──no session──→ /api/auth/login ──→ Google
                                                              │
        page  ←──valid @linqapp.com──  /api/auth/callback ←──┘
```

No npm dependencies — the session cookie is signed with the built-in Web
Crypto API. The static site stays static; only this thin auth layer is
serverless.

---

## One-time setup

### 1. Create the Google OAuth client

1. Go to **console.cloud.google.com** → pick (or create) a project on the
   **linqapp.com** organization.
2. **APIs & Services → OAuth consent screen**:
   - User type: **Internal** ← this alone restricts sign-in to the Linq
     Workspace (defense in depth with our domain check).
   - App name: `linq labs`. Save.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Name: `linq labs`
   - **Authorized redirect URIs** → add:
     `https://linq-labs.vercel.app/api/auth/callback`
     (add `http://localhost:3000/api/auth/callback` too if you'll run
     `vercel dev` locally)
   - Create. Copy the **Client ID** and **Client secret**.

### 2. Add the env vars in Vercel

Project **the-fundamentals** → **Settings → Environment Variables**
(scope: **Production**, and Preview if you want gated previews):

| Name                   | Value                                            |
|------------------------|--------------------------------------------------|
| `GOOGLE_CLIENT_ID`     | (from step 1)                                    |
| `GOOGLE_CLIENT_SECRET` | (from step 1)                                    |
| `AUTH_SECRET`          | output of `openssl rand -base64 32`              |
| `ALLOWED_HD`           | `linqapp.com`                                    |

### 3. Deploy

Add the env vars **before** (or with) the deploy that ships this code —
otherwise the site has no way to sign anyone in and will be inaccessible.

```
vercel --prod        # or: git push (auto-deploys)
```

Visit https://linq-labs.vercel.app → you should be redirected to Google,
sign in with your @linqapp.com account, and land back on the site. A
non-linqapp.com account gets a clean "Access denied" page.

---

## Notes / gotchas

- **Fail-closed:** if the env vars are missing, nobody can get in. That's
  intentional, but it means *don't deploy this code without the env vars set.*
- **Preview deployments** have unique URLs that won't match the Google
  redirect URI, so OAuth won't complete there unless you add each preview URL
  to the Google client. Easiest is to gate only Production.
- **Custom domain later?** Add `https://<domain>/api/auth/callback` to the
  Google client's Authorized redirect URIs.
- **Sign out:** visit `/api/auth/logout`.
- **Session length:** 7 days (`SESSION_TTL_SECONDS` in `lib/auth.js`).
- **Rotating access:** to force everyone to re-auth, change `AUTH_SECRET`.
