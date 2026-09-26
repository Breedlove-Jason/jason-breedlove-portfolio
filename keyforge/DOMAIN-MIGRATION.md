# KeyForge: proposed jasonbreedlove.io migration

Status: prepared, NOT deployed. No hosting service, paid resource, DNS record, domain assignment, or portfolio master content has been changed for this migration.

## Observed configuration, September 26, 2026

The connected Netlify project reader identifies `jbreedlove-clothing` (site `e178fb55-eb61-4d44-a914-939844bcf45b`) with primary URL `https://jasonbreedlove.io` and ready deployment `66f637af451f190008949c3f`.

Read-only DNS workflow https://github.com/Breedlove-Jason/jason-breedlove-portfolio/actions/runs/36273117644, job 108490703068, queried Cloudflare and Google resolvers. Both returned:

| Name | Type | Observed answer | TTL |
| --- | --- | --- | --- |
| jasonbreedlove.io | A | 75.2.60.5 | 14400 seconds |
| www.jasonbreedlove.io | CNAME | jbreedlove-clothing.netlify.app | 14400 seconds |
| jasonbreedlove.io | NS | dns1 through dns4.p04.nsone.net; ns01 through ns04.squarespacedns.com | 3600 seconds |

No apex AAAA, MX, TXT, or CAA answers were returned. This is not a complete zone export and is not proof that no mail-related or other subdomain records exist. The www AAAA query follows the Netlify CNAME; those target IPv6 addresses are not independent records to delete in this zone.

The nameserver families are compatible with Squarespace-managed DNS. They do not, by themselves, prove who the registrar is or indicate a broken delegation. Confirm the actual DNS control panel before making any change. Preserve nameservers, DNSSEC, mail records, and unrelated subdomains.

## Intended routing

- jasonbreedlove.io: ordinary KeyForge typing.
- jasonbreedlove.io/code-lab: separate developer Code Lab.
- jasonbreedlove.io/multiplayer: native racing.
- www.jasonbreedlove.io: redirect to the root domain.
- jasonbreedlove.dev: existing portfolio, unchanged.

## Cutover sequence

1. Confirm Render workspace and recurring hosting budget. No workspace has been selected or service purchased yet.
2. Prepare and deploy a separate service. The existing app uses internal HTTP port 3000 and game/WebSocket port 3001. Render exposes one public port; a tested internal proxy/shared-port entrypoint is required. The provided VPS Docker Compose/Caddy setup is not yet a verified Render deployment.
3. Provide persistent storage for the current SQLite/data directory and arrange application-consistent backups. Do not depend on Render's ephemeral filesystem. Code Lab remains local browser storage; a server disk does not create cloud sync for Code Lab.
4. Verify normal practice, statistics, Code Lab, persistence, and multiplayer on the assigned onrender.com host before changing production DNS.
5. Add jasonbreedlove.io to the Render service, including its www alias/redirect. Back up the actual DNS zone. Lower relevant TTLs in advance if supported; cached four-hour records do not immediately expire just because the TTL is lowered.
6. Only after the target is ready, replace the existing apex A with Render's currently documented 216.24.57.1, and the www CNAME with the actual assigned onrender.com hostname. Recheck Render's instructions at cutover. Never put a placeholder hostname into live DNS.
7. Verify DNS, issued TLS certificates, HTTPS, www redirect, and application configuration for the .io origin. Recheck any cookie/origin/provider callback settings when accounts are enabled.
8. Keep the clothing app available while caches drain. Then remove only the migrated custom-domain association from that Netlify project, and verify the project still works at its Netlify hostname without redirecting back to the migrated root. Do not delete its project, deployment, or repository.

## Official references

- https://render.com/docs/configure-other-dns
- https://render.com/docs/custom-domains
- https://render.com/docs/websocket
- https://render.com/docs/disks
- https://render.com/pricing
- https://support.squarespace.com/hc/en-us/articles/4404183898125-Review-change-or-reset-your-domain-s-nameservers

Published Render pricing observed today starts at $7/month for a 512 MB paid web instance and $0.25/GB/month for an attached disk. That gives a $7.25/month base example with 1 GB storage, not a performance guarantee or all-in quote. Memory sizing, workspace charges, tax, usage overages, custom-domain allowance, and backup storage must be considered. No payment was authorized by this document.

## Continuous refinement update

Code Lab's former weak-key path is now Continuous refinement. It recalculates the next lesson using recent language-specific key, pair, and allowlisted fragment performance. A 20-slot cycle reserves 12 repair, 5 review, and 3 exploration choices with fallback when a group is empty. Learned patterns are not graduated out of the candidate pool. Recent sessions weigh more heavily; time since practice contributes to review priority. Measured keys outside the current snippet corpus and whitespace fragments remain eligible.

After three sufficiently long matching sessions, a median-based pace reference suggests a 3% stretch when the last three reach 98% accuracy, otherwise a gentler 95% baseline reference. This is a configurable coaching heuristic, not a scientifically established optimum or a guarantee of continued speed gains. No fixed 200 WPM ceiling remains. The active lesson never changes under the cursor; new lessons are remixed from the existing corpus, not fetched from an external AI service. Daily challenges remain reproducible and ordinary Keybr progression remains separate.

The added fragment records are optional in version-1 backups, preserving older records. Custom pasted code opts out of longer-fragment capture. Code Lab is still local to each browser/origin: export a JSON backup before changing browser, device, or hostname.
