# linq labs

12 interactive courses teaching how software works. Static site deployed to Vercel.

This is the **public/shared** version. Jared's private version is at ~/jareds-lab (separate repo, no link).

## Start Claude Code from this directory

Always run `cd ~/linq-labs && claude` — not from `~`. This keeps memory scoped to this project.

## Decisions

- **No framework.** Static HTML, CSS, vanilla JS. No build step. Intentional.
- **One file per course.** Each course is a single self-contained HTML file. The tradeoff (large files, repeated sidebar HTML) is worth the simplicity.
- **Paperclip is the connective thread.** Every course references the Paperclip codebase (~/paperclip) as its running example. Don't introduce unrelated example apps.
- **CSS variables for all colors.** Light/dark theming works because every color is a variable. If you hardcode a hex value, the theme breaks. No exceptions.
- **Linq brand identity.** Lowercase "linq labs". Cube logo. FK Display font for body, Geist Mono for code. Logo uses CSS `filter: invert(1)` for light mode.

## Constraints

- Sidebar HTML is duplicated in every file. When adding a course, update all 12 lesson files + index.html.
- Lesson nav is in the sidebar (not a top bar). Lessons are injected dynamically by shared.js using the `courseIndex` array.
- The `courseIndex` array in `js/shared.js` powers Cmd+K search and sidebar lessons. Must stay in sync.
- Code blocks need class `code-block` for auto copy buttons. Don't add copy buttons manually.
- Some courses use `goTo(n)`, others use `goToLesson(n)`. Both are wrapped by shared.js.
- View Transitions API handles cross-page fades. Sidebar has `view-transition-name: sidebar` to stay static.

## Auth gate

- The site is gated behind **Google sign-in** (only verified `@linqapp.com`).
  Enforced by `middleware.js` (Vercel Edge) + `api/auth/*`, session signed with
  Web Crypto (no npm deps). Added so the site can hold real internal content
  (e.g. the Linq Data Layer course) without being publicly readable.
- **Fail-closed:** requires env vars `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `AUTH_SECRET`, `ALLOWED_HD`. If they're unset, nobody can get in — don't deploy
  the auth code without setting them first. Full setup in [AUTH.md](AUTH.md).
- This is the one exception to "no build step": the static site stays static;
  only the thin auth layer is serverless.

## Deploy

```
vercel --prod
```

Production: https://linq-labs.vercel.app
Vercel project: jared-2093s-projects/the-fundamentals
