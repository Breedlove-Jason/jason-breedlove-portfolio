# KeyForge: Keybr foundation + developer Code Lab

Target domain: `typing.jasonbreedlove.dev`. This directory is isolated on `feature/keyforge-typing`; it does not replace the portfolio or modify `master`.

## Reconstruct the complete source

From this branch's repository root:

```sh
python3 keyforge/setup.py ../keyforge-app
cd ../keyforge-app
```

The setup script downloads the public upstream repository at commit `e9c11fea284b8c861547173639580fe1442621b7`, verifies the commit, copies this complete readable overlay, and applies checked patches. It refuses to overwrite an existing destination. Upstream source is at https://github.com/aradzie/keybr.com/tree/e9c11fea284b8c861547173639580fe1442621b7 . The upstream LICENSE is GNU Affero General Public License version 3; it is preserved in the reconstructed source. The upstream package.json license label is corrected by the patch. Original additions are AGPL-3.0-or-later.

## What is preserved

Native adaptive typing practice, typing tests, keyboard layouts/languages, profile statistics, high scores, and multiplayer car racing come from the pinned Keybr source. Accounts and ordinary-profile sync remain available in source but are disabled until the operator supplies authentication configuration. Keybr service users and data are not copied. This independent installation starts empty.

## What Code Lab adds

A separate `/code-lab` navigation item beside Multiplayer. Sixteen language/tool tracks: JavaScript, TypeScript, React, Python, Flask, Django, HTML, CSS, SQL, Bash, Git, JSON, Java, C++, Rust, Go. Sixty-four original snippets; seven paths covering code, symbols, naming, indentation, weak-key repair, daily challenges, and custom text. Foundation/working/fluent depth; snippet completion and 15/30/60/120-second sessions; stop-on-error, correction, and zero-error modes.

Real WPM/raw WPM, accuracy, consistency, error/correction counts, key latency, category accuracy, session curves, matching-preset bests, history, JSON backup/import, and CSV exports. Up to 200 locally saved sessions. Custom code is never executed or included in history. Do not type passwords or secrets: key/pair aggregates reveal character patterns. Code Lab has separate local storage and does not yet use account cloud sync. Its UI is English with a US QWERTY reference; input follows the actual keyboard. Indentation uses real spaces, not free Tab autocompletion.

## Safe production launch

A persistent container host is required for this unmodified server architecture: SQLite, session/result files, and the native game process retain state. The proxy routes `/_/game/*` to port 3001 and ordinary HTTP to 3000. Do not deploy this full fork as a static folder and claim online accounts/racing work.

After provisioning the host and pointing only the `typing` DNS record to it:

```sh
cp .env.keyforge.example .env
# Review .env. Keep accounts off until configured.
docker compose up -d --build
docker compose logs -f app
```

Caddy requests HTTPS for the exact target domain. Ports 80 and 443 must reach the proxy. Back up the named `keyforge_data` volume. Never delete it as a routine deployment step. Keep a single game-server instance unless you add a shared multiplayer state architecture. Database initialization creates schema only; it never creates the upstream predictable demo login. The advertising/analytics injection and paid upsell UI are removed. Hosted authentication endpoints are off by default.

## Development and checks

The pinned upstream requires Node 26. From reconstructed source:

```sh
HUSKY=0 npm ci
npm run compile
npm run test:code-lab
npm run build
```

For Code Lab alone, no Node dependencies are needed: serve `root/public` with `python3 -m http.server 4173 --directory root/public` and open `/code-lab/index.html`. That isolated preview does not contain working normal-typing/racing routes. JSON backups transfer Code Lab progress between origins and devices.

The CI workflow compiles/builds the full fork and runs checks. Read the actual run result; existence of this recipe is not proof of a successful deployment. No DNS records, production host, or live authentication have been configured by these files.
