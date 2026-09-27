# KeyForge: custom domain verified live

Verified September 26, 2026, at 5:04:31 PM America/Los_Angeles (September 27, 2026, 00:04:31 UTC).

## Result

KeyForge's primary public address is https://jasonbreedlove.io/. Both the root and www certificates passed standard TLS hostname and trust-chain validation in a public network test. HTTPS warnings were not bypassed.

The following paths on jasonbreedlove.io each returned HTTP 200: `/`, `/typing-test`, `/profile`, `/code-lab`, `/code-lab/index.html`, `/multiplayer`, and `/healthz`.

A request to https://www.jasonbreedlove.io/ successfully followed the redirect to https://jasonbreedlove.io/ and ended with HTTP 200.

A secure WebSocket handshake to `wss://jasonbreedlove.io/_/game/server` with Origin `https://jasonbreedlove.io` returned HTTP 101. Sec-WebSocket-Accept was verified against the generated request key. This establishes secure racing connectivity, not a full multi-player race or broad gameplay certification.

The root certificate is from Google Trust Services WE1, names jasonbreedlove.io, and expires December 25, 2026, at 23:57:34 UTC. The www certificate is also from Google Trust Services WE1, names www.jasonbreedlove.io, and expires December 26, 2026, at 00:00:07 UTC.

## Corrected application setting and storage

APP_URL was set to `https://jasonbreedlove.io/` using Render's merging environment update. This corrected the earlier HTTP 400 response when the application rejected the new hostname. The earlier www TLS handshake failure also no longer reproduces in the final test; no certificate setting was changed by the assistant.

The same update set KEYFORGE_ALLOW_EPHEMERAL_PREVIEW to `false`, after the mount was confirmed. Public health reports status `ok`, storage `persistent`, accountsEnabled `false`, revision `4380cf2a15a7`, and transport `single-port`.

Render reports a 1 GB disk attached at `/var/data`. The existing Starter service remains `srv-das4bm60tbcc73dpff80` in workspace `tea-danggj6k1f9s738ljc1g`. Deployment `dep-das5oum0tbcc73dunoag` reached live status in the service log at 00:03:41 UTC.

## Evidence and limits

GitHub Actions run 36281204194, retry job 108513716403, passed. The verified JSON is artifact 10918253579, `keyforge-io-domain-verification`. It is a public-origin HTTP, TLS, and WebSocket transport check, not a new browser interaction suite.

The first attempt (job 108513217288) passed the root homepage immediately after deploy but encountered HTTP 502 on the next route. The unchanged test was rerun; all seven routes then passed. The earlier failed attempt has not been represented as a success.

Prior DNS checks in run 36281091916 found agreement across Google, Cloudflare, and two authoritative servers: the apex points to 216.24.57.1 and www points to keyforge-va3d.onrender.com. No apex AAAA or CAA conflict was observed. The zero spelling jas0nbreedlove.io returned NXDOMAIN; the intended spelling uses the letter o.

No DNS record, nameserver, Netlify project, repository, or portfolio production content was deleted or modified during this fix. The clothing project remains protected. No new paid service or larger plan was created.

Hosted accounts remain disabled. Code Lab history is browser-local, not cloud-synchronized. Do not clear site storage casually; use the application's JSON export/import when moving history across origins.

The portfolio addition is still a separate draft pull request and was not published by this certificate repair.
