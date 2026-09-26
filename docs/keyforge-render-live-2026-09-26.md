# KeyForge: live Render verification, September 26, 2026

## Outcome

The complete KeyForge application is running at https://keyforge-va3d.onrender.com. Render reports fixed deployment `dep-das4f6e0tbcc73dps9s0` live, finished at 22:35:02 UTC. Public-origin checks subsequently passed against application revision `e1a17e1f6c3d`.

Service: `keyforge` (`srv-das4bm60tbcc73dpff80`). Workspace: Jason Breedlove Projects (`tea-danggj6k1f9s738ljc1g`). Region: Oregon. Instance plan: Starter, one instance, auto-deploy disabled. Dashboard: https://dashboard.render.com/web/srv-das4bm60tbcc73dpff80.

The owner approved the Starter service and a 1 GB disk. No larger paid instance or paid workspace upgrade was requested. The disk has NOT been attached by the assistant.

## Actual deployed-site checks

GitHub Actions run `36276563568`, job `108500337512`, completed successfully. Evidence artifact `10917705568` (keyforge-deployed-render-evidence) was downloaded and inspected. This workflow used agent-browser and Python Playwright against the actual HTTPS Render hostname, not a localhost replacement.

- Successful HTTP responses: `/`, `/typing-test`, `/profile`, `/code-lab`, `/code-lab/index.html`, `/multiplayer`.
- Public health at 22:35:14 UTC: status `ok`, transport `single-port`, revision `e1a17e1f6c3d`, storage `temporary-preview`, accountsEnabled `false`.
- A request with a spoofed forwarded hostname remained on the configured public origin and returned HTTP 200.
- A secure same-origin racing WebSocket opened successfully.
- All 11 live browser assertions passed. They covered Code Lab loading, 16 language tracks, seven practice paths, error handling, a completed typing result, real browser storage surviving reload, mobile width, the embedded Code Lab route, ordinary navigation, and no uncaught page errors.
- Screenshots of ordinary practice and Code Lab were inspected.

The live WebSocket test checks connectivity, not a complete multi-user race on Render. A separate predeployment CI run `36275482963` passed the two-client native race protocol test on a local HTTP origin. These are different scopes of verification.

## Resolved deployment defect

The initial deployment started but returned HTTP 400 for framework-served pages. The framework requires both forwarded protocol and hostname when configured behind a proxy. The Render adapter now derives both from configured origins matched against the real Host header, rejects unknown hosts, and retains WebSocket browser-origin checks. Fixed source commit: `e1a17e1f6c3dabf88d89a69dc81144c5df51fe57`.

## Still required

1. Add the approved 1 GB persistent disk to this service through Render's Disks page, mounted at `/var/data`. The available connector does not expose a disk-attachment action.
2. After Render redeploys, confirm the runtime actually detects the mount and `/healthz` reports `storage: "persistent"`. Then disable `KEYFORGE_ALLOW_EPHEMERAL_PREVIEW`. Do not disable the preview fallback before attaching the disk.
3. Verify restart persistence and arrange application-consistent backups before storing important server-side account data. Hosted accounts remain disabled until their authentication provider is configured and tested.
4. Code Lab history is browser-local. A server disk does not add Code Lab cloud sync. Export/import history when changing browser or origin.
5. `jasonbreedlove.io` has not been moved to Render. Custom-domain setup and DNS/HTTPS cutover remain separate future work.

## Existing-site protection

The owner revoked the old Netlify deletion instruction. No Netlify project, deployment, repository, domain registration, DNS zone, or DNS record was deleted or modified during this Render launch. The existing `jbreedlove-clothing` project and the portfolio's master branch were left unchanged. Do not infer deletion permission from historical commit messages. See `keyforge/DOMAIN-MIGRATION.md` for the superseding preservation instructions.

This record supersedes the earlier BUILDING status in the migration document. It does not claim that persistent storage, account synchronization, or the .io cutover is complete.
