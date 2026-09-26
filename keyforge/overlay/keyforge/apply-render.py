#!/usr/bin/env python3
"""Add an opt-in single-process Render entrypoint to the reconstructed fork."""
from pathlib import Path
import json
ROOT = Path(__file__).resolve().parents[1]
marker = ROOT / 'KEYFORGE_RENDER_PATCHED'
if marker.exists():
    raise SystemExit('Render integration already applied; refusing to patch twice.')
main = ROOT / 'packages/server/lib/main.ts'
text = main.read_text()
anchor = 'if (cluster.isPrimary) {'
if text.count(anchor) != 1:
    raise SystemExit('Unexpected server entrypoint; no edit performed.')
text = 'import { Server, ServerResponse } from "node:http";\nimport Knex from "knex";\nimport { WebSocketServer } from "ws";\n' + text
text = text.replace(anchor, 'if (process.env.KEYFORGE_SINGLE_PORT === "true") {\n  startSinglePort();\n} else ' + anchor, 1)
text += (ROOT / 'keyforge/render-single-port.txt').read_text()
main.write_text(text)
shell = ROOT / 'packages/keybr-pages-server/lib/Shell.tsx'
text = shell.read_text()
anchor = '    <body>\n      <Root>'
if anchor not in text:
    raise SystemExit('Unexpected HTML shell; refusing a blind patch.')
text = text.replace(anchor, '''    <body>
      {process.env.KEYFORGE_STORAGE_MODE === "temporary-preview" &&
        <aside style={{ padding: "0.6rem 1rem", textAlign: "center", background: "#fff3cc", color: "#332600", fontSize: "0.85rem" }}>
          Preview: typing progress stays in this browser. Server disk setup is pending; cloud accounts are off.
        </aside>}
      <Root>''', 1)
shell.write_text(text)
package = ROOT / 'package.json'
data = json.loads(package.read_text())
data['scripts']['start:render'] = 'node keyforge/render-start.mjs'
package.write_text(json.dumps(data, indent=2) + '\n')
marker.write_text('Single-port runtime; persistent disk detection; anonymous preview fallback.\n')
print('Applied Render single-port integration; native dual-port mode remains available.')
