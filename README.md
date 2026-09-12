# Jason Breedlove — developer portfolio

A complete React portfolio built with **strict TypeScript, Tailwind CSS 4, and Vite**, with an **Express + TypeScript contact API** and a small SQLite inbox. The site foregrounds Jason’s real engineering projects, then connects them to his technical education and decorated Army service.

## Run locally

Requires **Node.js 24+** and **pnpm 11**.

```sh
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

- Website: `http://127.0.0.1:5173`
- API: `http://127.0.0.1:3001`
- The Vite development server proxies `/api` to the Express server.

## Build and run

```sh
pnpm build
pnpm start
```

The compiled Express server serves both `dist/` and the contact API at `http://127.0.0.1:3001`. The TypeScript backend is compiled into `dist-server/`; its SQL schema is copied as part of the build. No TypeScript runtime loader is required in production.

```sh
pnpm typecheck
pnpm test
pnpm format
```

## Component architecture

```text
src/
  App.tsx                         Page composition and footer
  components/
    Header.tsx                    Responsive navigation, Escape handling
    Hero.tsx                      Professional positioning and résumé link
    SystemConstellation.tsx       Canvas geometry, focus controls, reduced motion
    Projects.tsx                  Filterable projects and engineering notes
    Expertise.tsx                 Technical skills by discipline
    Experience.tsx                Career timeline and valor callout
    About.tsx                     Professional background and education
    Contact.tsx                   Validated form and request states
    SectionHeading.tsx            Shared section typography
  data/projects.ts                Typed project descriptions, status, source links
  styles.css                      Tailwind theme and component compositions
shared/contact.ts                 Client/server contact types
server/
  app.ts                          Express factory and Zod request schema
  store.ts                        SQLite persistence with bound parameters
  schema.sql                      Inbox table and database constraints
  index.ts                        Configuration and graceful shutdown
  contact.test.ts                 API boundary and persistence tests
```

Tailwind is installed through its Vite plugin. `src/styles.css` defines the color and font tokens with `@theme`, then composes reusable component classes with `@apply` inside `@layer components`. Custom gradients, projection geometry, and fine typography remain explicit CSS. Fonts are served locally.

The constellation is a perspective-projected Fibonacci sphere rendered with Canvas 2D. Its points illustrate a geometric network; they are not live infrastructure, performance metrics, or telemetry. Users can pause it or change the technical focus. Animation respects reduced-motion preferences and stops when hidden or out of view.

## Contact API and schema

`POST /api/contact`, with `Content-Type: application/json`:

```json
{
  "name": "Your name",
  "email": "you@example.com",
  "subject": "Software development opportunity",
  "message": "A message between 20 and 4,000 characters.",
  "website": ""
}
```

| Field | Validation |
| --- | --- |
| `name` | Trimmed, single line, 2–100 characters |
| `email` | Valid email address, at most 254 characters |
| `subject` | Trimmed, single line, 2–160 characters |
| `message` | Trimmed, 20–4,000 characters |
| `website` | Empty honeypot; populated submissions are discarded |

Successful persistence returns `201` and `{ id, message }`. Invalid fields return `422`; unapproved browser origins return `403`; repeated submissions return `429`. Other failures return structured JSON and never pretend the message was saved. Request bodies are limited to 24 KB. Security headers and a self-only Content Security Policy are set by Helmet.

Messages are stored in `data/contact.sqlite`, with a generated UUID, UTC timestamp, and `new` status. SQLite is accessed through Node’s built-in `node:sqlite` API, with parameterized inserts. The process uses a restrictive file permission mask. Contact data has no public read endpoint.

**This implementation saves messages to an inbox; it does not send notification email.** Jason can review the newest 100 entries locally after a build:

```sh
pnpm messages
```

The command prints contact details and should only be used on the trusted server. The `mailto:` link remains available for direct email.

## Preparing for jasonbreedlove.dev

The source and local preview are complete. Domain records and public hosting have not been changed.

Deploy the compiled frontend and backend together on a Node.js host with a persistent volume for SQLite. Set:

```dotenv
NODE_ENV=production
HOST=127.0.0.1
PORT=3001
ALLOWED_ORIGINS=https://jasonbreedlove.dev
CONTACT_DB_PATH=/persistent-data/contact.sqlite
TRUST_PROXY_HOPS=1
```

Terminate HTTPS at a trusted reverse proxy and forward the site and API to Express. `TRUST_PROXY_HOPS=1` is appropriate only when every request passes through exactly one trusted proxy and clients cannot bypass it; otherwise use the verified hop count or leave it at `0`. For hosts that require binding all interfaces, use `HOST=0.0.0.0` behind the host’s routing/firewall. Include any additional real site origins explicitly in `ALLOWED_ORIGINS`.

Keep the database on persistent storage, back it up, and set an appropriate retention policy. The included rate limiter is for one Node process. Multiple instances require shared rate limiting and a shared database adapter. Add email notification delivery if a hosted inbox notification workflow is desired. This Express application is intended for a Node host, rather than a Cloudflare Worker runtime.

## Content and maintenance

- Project copy is based on repository evidence, with public links only for public repositories. Private projects have a discussion link.
- Work in development and research prototypes are labeled. No unverified user counts, revenue, deployment success, or model performance are presented.
- Academic honors reflect Jason’s correction: associate’s degree with honors; repeated President’s and Dean’s List placement during bachelor’s studies.
- The provided 2024 résumé is available unchanged at `public/Jason-Breedlove-Resume.pdf`. It predates the website’s corrected academic honors.
- The 4.0 GPA is retained from the supplied résumé; it is not assigned to a specific degree.
- `docs/CONTENT_SOURCES.md` records the provenance and limitations behind the content.

Implementation references: [Tailwind with Vite](https://tailwindcss.com/docs/installation/using-vite), [Node SQLite](https://nodejs.org/api/sqlite.html), and [Express 5](https://expressjs.com/en/guide/migrating-5/).
