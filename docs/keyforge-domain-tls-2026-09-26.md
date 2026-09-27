# KeyForge custom-domain diagnosis

## Public checks at 2026-09-26 23:59 UTC

Source: GitHub Actions run 36281091916, job 108512908781. This was a public network check with standard hostname and certificate-chain verification enabled; certificate warnings were not bypassed.

- Cloudflare 1.1.1.1, Google 8.8.8.8, ns01.squarespacedns.com, and dns1.p04.nsone.net agreed on `jasonbreedlove.io A 216.24.57.1` and `www.jasonbreedlove.io CNAME keyforge-va3d.onrender.com`.
- No apex AAAA address or apex CAA record was returned. The www queries followed its expected Render CNAME, without an independent conflicting www AAAA record.
- `jasonbreedlove.io` passed TLS hostname and trust-chain verification. Its Google Trust Services WE1 certificate names jasonbreedlove.io and expires December 25, 2026, at 23:57:34 UTC.
- The root homepage returned HTTP 400 `Bad Request`, while its `/healthz` returned HTTP 200 and reported `storage: persistent`, `accountsEnabled: false`, and revision `6fa259b001d1`.
- `www.jasonbreedlove.io` failed the TLS handshake. This check cannot identify the precise certificate-issuance error shown inside Render's Custom Domains dashboard.
- The original Render hostname passed TLS verification and returned HTTP 200 for its homepage and health endpoint.
- The alternate spelling `jas0nbreedlove.io`, with a zero, returned NXDOMAIN. The intended domain uses the letter o: jasonbreedlove.io.

## Configuration correction

The application validates request hosts against APP_URL and RENDER_EXTERNAL_URL. The new .io hostname had not been accepted by the running application.

Using Render's merging environment-variable update, APP_URL was set to `https://jasonbreedlove.io/`. The independently confirmed persistent mount also allowed KEYFORGE_ALLOW_EPHEMERAL_PREVIEW to be set to `false`. Existing environment variables were preserved.

Render automatically started deployment `dep-das5oum0tbcc73dunoag` of revision `4380cf2a15a77ea576c33965ecf029b9eebfa8b0`. No duplicate deployment was requested.

The connected service reports one Starter instance and a 1 GB disk at `/var/data`. No larger instance or new paid resource was created.

## Scope

No DNS records, nameservers, certificate settings, Netlify projects, GitHub repositories, or portfolio production content were deleted or modified by this diagnostic work. The owner's instruction to preserve the clothing project remains in force.

Hosted accounts remain disabled. Persistent server storage does not create Code Lab cloud synchronization. Code Lab history remains browser-local.

Post-deployment .io route, TLS, and secure WebSocket verification is recorded separately by the `KeyForge io application check` workflow. Do not infer successful .io homepage recovery or www certificate issuance from this initial diagnosis alone.
