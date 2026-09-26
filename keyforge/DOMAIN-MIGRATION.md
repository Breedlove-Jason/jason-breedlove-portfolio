# KeyForge: Render-first launch; existing Netlify site preserved

## Current owner instructions

**Do not delete the existing website or the Netlify clothing project.** On September 26, 2026, the owner explicitly withdrew the earlier deletion request and asked to get KeyForge running on Render now that payment is on file. This supersedes all earlier retirement/deletion instructions in this document and conversation.

Preserve Netlify project `jbreedlove-clothing`, site ID `e178fb55-eb61-4d44-a914-939844bcf45b`, its deployments and repository, `jasonbreedlove.io`, the DNS zone, domain registration, nameservers, DNSSEC, mail records, unrelated subdomains, and the existing portfolio at `jasonbreedlove.dev`. No Netlify or DNS writes are part of this Render-first deployment. A later domain cutover must not be confused with permission to delete a project.

The owner approved the Render workspace **Jason Breedlove Projects** (`tea-danggj6k1f9s738ljc1g`) for the $7/month Starter web service and a 1 GB persistent disk at the previously quoted $0.25/month. A larger paid plan requires separate approval. This is a base configuration, not an all-in billing or capacity guarantee.

The intended eventual public home remains **jasonbreedlove.io**, with all ordinary practice, tests, statistics, Code Lab and racing on that domain. First deploy and verify the entire application on its assigned Render hostname. Leave the existing .io website alone during that work.

## Deployment started

Render accepted service creation after the owner added payment information:

- Service: `keyforge`, ID `srv-das4bm60tbcc73dpff80`.
- Workspace: `tea-danggj6k1f9s738ljc1g`.
- Region: Oregon. Plan: Starter. One instance. Auto-deploy: off.
- Assigned hostname: https://keyforge-va3d.onrender.com
- Dashboard: https://dashboard.render.com/web/srv-das4bm60tbcc73dpff80
- Initial deploy: `dep-das4bmm0tbcc73dpfgdg`, created September 26, 2026, 22:23:22 UTC.
- Initial application commit: `7e85fb071c278b46955c28d40aec6c70f471a620` from `feature/keyforge-typing`.
- Build command: `bash keyforge/render/build.sh`.
- Start command: `cd .keyforge-runtime && node --max-old-space-size=320 keyforge/render-start.mjs`.
- Node: 26.10.0. Public port: 10000. Website and racing share this port.

At this document update the deploy is still building; service creation is not proof of a successful live deployment. Check Render deploy status, runtime health and live browser evidence before claiming completion.

Hosted accounts are disabled. Temporary anonymous preview storage is explicitly allowed until the disk is attached. The connector cannot attach a persistent disk. The owner can open the service's Disks page and add a 1 GB disk at `/var/data`. Render redeploys after adding the disk. Confirm `/healthz` reports `storage: "persistent"`, then disable `KEYFORGE_ALLOW_EPHEMERAL_PREVIEW` before treating server data as durable. Merely setting the mount-path environment variable does not attach a disk.

The prior exact Render-runtime CI run `36275482963` passed build, single-port startup, two-client race protocol checks and real browser checks. A separate workflow `.github/workflows/keyforge-render-live.yml` verifies the actual assigned public Render origin, its HTTPS routes, secure racing connection, and local-browser persistence. These are distinct from custom-domain validation and durable-storage validation.

## Intended eventual public routing

- https://jasonbreedlove.io/ : ordinary typing practice.
- https://jasonbreedlove.io/typing-test : typing tests.
- https://jasonbreedlove.io/profile : ordinary typing statistics.
- https://jasonbreedlove.io/code-lab : developer Code Lab and its statistics.
- https://jasonbreedlove.io/multiplayer : native racing.
- wss://jasonbreedlove.io/_/game/server : same-origin racing WebSocket.
- https://www.jasonbreedlove.io/ : redirect to the root domain, preserving paths.

The Render hostname is a pre-cutover verification address, not a separate intended home for one section.

## Historical DNS observation, September 26, 2026

Read-only workflow https://github.com/Breedlove-Jason/jason-breedlove-portfolio/actions/runs/36273117644 queried Cloudflare and Google resolvers. Both returned:

| Name | Type | Observed answer | TTL |
| --- | --- | --- | --- |
| jasonbreedlove.io | A | 75.2.60.5 | 14400 seconds |
| www.jasonbreedlove.io | CNAME | jbreedlove-clothing.netlify.app | 14400 seconds |
| jasonbreedlove.io | NS | dns1 through dns4.p04.nsone.net; ns01 through ns04.squarespacedns.com | 3600 seconds |

No apex AAAA, MX, TXT or CAA answers were returned. This is not a complete DNS-zone export and does not prove there are no mail-related subdomain records. The www AAAA response follows the Netlify CNAME; the target IPv6 addresses are not independent records in this zone. Confirm the authoritative DNS dashboard before any later approved edits.

## Later cutover checklist, not an instruction to change DNS now

1. Verify the Render site, disk usage, restart behavior, local-browser statistics, racing and application-consistent backups.
2. Add the .io domain and www redirect to the Render service only as part of the agreed later cutover. Back up actual DNS records. Recheck Render's current record requirements; do not enter placeholder values.
3. Change only the approved website records after the target works. The previously documented Render apex address was 216.24.57.1; the assigned hostname is keyforge-va3d.onrender.com. Cached four-hour records do not immediately expire when TTL is lowered.
4. Verify DNS, issued TLS, redirects, application links, cookies and same-origin racing. Configure APP_URL and origin handling for the final domain.
5. Preserve the Netlify project. Do not delete it, its repository, or any shared DNS zone. Domain reassignment and project deletion are different actions.
6. Export/import browser-local practice data when changing origins. A domain switch does not transfer local storage automatically.

## Continuous refinement

Code Lab recalculates each next refinement lesson from recent language-specific key, pair and allowlisted fragment performance. The 20-slot cycle reserves 12 repair, 5 review and 3 exploration choices, with fallbacks. Learned patterns remain eligible; recent performance and time since practice affect priority.

After three sufficiently long matching sessions, the recent median suggests a 3% stretch when the last three reach 98% accuracy, otherwise a gentler 95% baseline reference. This is a tunable coaching heuristic, not a promise of unlimited speed gains. There is no fixed 200 WPM setting ceiling. Lessons never change beneath the active cursor. Daily challenges remain reproducible and ordinary Keybr progression is separate.

Version-1 backups remain readable. Custom pasted code opts out of longer-fragment retention. Code Lab history is local to each browser/origin; attaching a server disk does not enable Code Lab cloud sync.

## References

- https://render.com/docs/configure-other-dns
- https://render.com/docs/custom-domains
- https://render.com/docs/websocket
- https://render.com/docs/disks
- https://render.com/pricing
