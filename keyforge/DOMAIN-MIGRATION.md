# KeyForge: jasonbreedlove.io launch and Netlify retirement

## Owner decisions

On September 26, 2026, the owner approved using the Render workspace **Jason Breedlove Projects** (`tea-danggj6k1f9s738ljc1g`) for a $7/month Starter web service and a 1 GB persistent disk at the previously quoted $0.25/month. A larger paid plan requires separate approval. This is an approved base configuration, not a guarantee of total billing or sufficient capacity for every workload.

The owner subsequently authorized deleting the old Netlify project **jbreedlove-clothing**, site ID `e178fb55-eb61-4d44-a914-939844bcf45b`. It is not necessary to preserve that deployed project. This does not authorize deleting its GitHub repository, other Netlify projects, the domain registration, a shared DNS zone, mail records, or the portfolio.

All KeyForge pages and public racing traffic are to use **jasonbreedlove.io**. The existing portfolio at **jasonbreedlove.dev** remains unchanged. No KeyForge section is to remain hosted at a Netlify project or the earlier proposed typing.jasonbreedlove.dev address.

## Current status

- A Starter web-service creation request returned HTTP 402: payment information is required. Render directed the owner to https://dashboard.render.com/billing.
- A subsequent connected Render service listing did not contain KeyForge. No KeyForge service ID or assigned hostname has been obtained.
- The connected Netlify project reader still returns the clothing project with primary URL https://jasonbreedlove.io and ready deploy `66f637af451f190008949c3f`.
- No DNS or domain assignment has been changed. The Netlify project has not been deleted.
- The current Netlify connector does not expose project deletion. No authenticated Netlify CLI session or token is available in this working environment. Deletion must use an authorized dashboard/CLI session, not an invented connector action.
- The Render-specific single-port server and build integration are committed to feature/keyforge-typing. Production deployment, a real persistent-disk mount, custom-domain validation, and issued TLS certificates have not been verified.

## Intended public routing

- https://jasonbreedlove.io/ : ordinary typing practice.
- https://jasonbreedlove.io/typing-test : typing tests.
- https://jasonbreedlove.io/profile : ordinary typing statistics.
- https://jasonbreedlove.io/code-lab : separate developer Code Lab and its statistics.
- https://jasonbreedlove.io/multiplayer : native racing.
- wss://jasonbreedlove.io/_/game/server : racing WebSocket on the same origin.
- https://www.jasonbreedlove.io/ : redirect to the root domain, preserving paths.

An assigned onrender.com URL may be used for pre-cutover verification. It is a hosting address, not a different intended public home for a KeyForge section.

## Observed DNS, September 26, 2026

Read-only workflow https://github.com/Breedlove-Jason/jason-breedlove-portfolio/actions/runs/36273117644 queried Cloudflare and Google public resolvers. Both returned:

| Name | Type | Observed answer | TTL |
| --- | --- | --- | --- |
| jasonbreedlove.io | A | 75.2.60.5 | 14400 seconds |
| www.jasonbreedlove.io | CNAME | jbreedlove-clothing.netlify.app | 14400 seconds |
| jasonbreedlove.io | NS | dns1 through dns4.p04.nsone.net; ns01 through ns04.squarespacedns.com | 3600 seconds |

No apex AAAA, MX, TXT, or CAA answers were returned. This is not a complete DNS-zone export. It does not prove that no mail-related or other subdomain records exist. The www AAAA response follows the Netlify CNAME; those target IPv6 addresses are not independent records in this zone.

Confirm the actual authoritative DNS dashboard before edits. Preserve nameservers, DNSSEC, mail records, and unrelated subdomains.

## Cutover and deletion sequence

1. The owner adds payment information directly in the approved Render workspace. Never request payment-card details in chat. Recheck for an existing KeyForge service before retrying creation to prevent duplicates.
2. Deploy and verify the separate KeyForge service using the committed Render build and start commands. Attach the approved 1 GB persistent disk and verify the application actually uses it. Turn off temporary-preview mode before treating server data as durable or enabling accounts.
3. Test normal practice, tests, statistics, Code Lab, local persistence, multiplayer, health, and restart behavior on the assigned Render hostname. Arrange application-consistent database backups before storing important server-side user data.
4. Add jasonbreedlove.io and its www redirect to the Render service. Back up the DNS zone. Lower relevant TTLs in advance if supported; cached four-hour records do not immediately expire when their TTL is lowered.
5. After the target is ready, replace only the website DNS records using the actual values from Render. Render's previously documented apex address was 216.24.57.1; recheck it at cutover. Point www at the real assigned Render hostname. Never enter a placeholder into live DNS.
6. Verify DNS, HTTPS, issued certificates, canonical redirects, same-origin WebSocket traffic, cookies, and application links. Configure APP_URL and origin allowlists for https://jasonbreedlove.io. Export/import browser-local practice data when changing origins; a domain change does not transfer local storage.
7. After DNS no longer points to Netlify and prior caches have drained, **delete only jbreedlove-clothing**, site `e178fb55-eb61-4d44-a914-939844bcf45b`, as authorized. Confirm the selected site ID and that the delete operation does not include any shared DNS zone. Do not delete the GitHub repository or other projects. Removing obsolete DNS pointers before deletion avoids leaving a domain aimed at a deleted project.
8. Verify that the old project is absent from Netlify and KeyForge still works at jasonbreedlove.io. Record the successful Render service/deploy IDs and domain verification results.

## Continuous refinement

Code Lab's Continuous refinement path recalculates each next lesson from recent, language-specific key, pair, and allowlisted fragment performance. The 20-slot cycle reserves 12 repair, 5 review, and 3 exploration choices, with fallbacks when a group is empty. Learned patterns remain eligible. Recent performance and time since practice affect review priority.

After three sufficiently long matching sessions, a median-based pace reference suggests a 3% stretch when the last three reach 98% accuracy, otherwise a gentler 95% baseline reference. This is a tunable coaching heuristic, not a promise of unlimited human speed gains. There is no fixed 200 WPM setting ceiling. Lessons never change beneath the active cursor. Daily challenges stay reproducible and ordinary Keybr progression remains separate.

Older version-1 backups remain readable. Custom pasted code opts out of longer-fragment retention. Code Lab history is local to each browser/origin, not automatically synchronized by the server disk.

## References

- https://render.com/docs/configure-other-dns
- https://render.com/docs/custom-domains
- https://render.com/docs/websocket
- https://render.com/docs/disks
- https://render.com/pricing
- https://cli.netlify.com/commands/sites/
