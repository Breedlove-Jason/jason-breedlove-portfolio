#!/usr/bin/env python3
"""Reconstruct and lock the full KeyForge fork. Requires Git, Python, and Node/npm."""
from pathlib import Path
import argparse
import base64
import hashlib
import json
import shutil
import subprocess
import sys
SHA = 'e9c11fea284b8c861547173639580fe1442621b7'
HERE = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('destination', help='A new, empty destination directory')
args = parser.parse_args()
dest = Path(args.destination).resolve()
if dest.exists():
    raise SystemExit('Destination exists. Choose a new directory; nothing was overwritten.')
for tool in ('git', 'npm'):
    if shutil.which(tool) is None:
        raise SystemExit(f'{tool} is required. Install Git and Node 26 before reconstructing.')
subprocess.run(['git', 'clone', '--no-checkout', 'https://github.com/aradzie/keybr.com.git', str(dest)], check=True)
subprocess.run(['git', 'checkout', '--detach', SHA], cwd=dest, check=True)
actual = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=dest, text=True).strip()
if actual != SHA:
    raise SystemExit('Upstream commit verification failed.')
shutil.rmtree(dest / '.git')
shutil.copytree(HERE / 'overlay', dest, dirs_exist_ok=True)
shutil.copyfile(HERE / 'README.md', dest / 'README-KEYFORGE.md')
(dest / 'UPSTREAM_COMMIT').write_text(SHA + '\n')
subprocess.run([sys.executable, str(dest / 'keyforge/apply-fork.py')], check=True)
# Native navigation reads link.title on every literal in its page union.
pages = dest / 'packages/keybr-pages-shared/lib/pages.ts'
text = pages.read_text()
anchor = '      icon: mdiCodeBraces,'
if anchor not in text:
    raise SystemExit('Code Lab navigation anchor missing; no blind edit performed.')
text = text.replace(anchor, '      title: defineMessage({ id: "keyforge.codeLab", defaultMessage: "Code Lab" }),\n' + anchor, 1)
pages.write_text(text)
# The upstream production transformer hashes IDs and strips default messages.
# Add the new branded label to both source catalogs and compiled ICU AST catalogs.
message_id = base64.b64encode(hashlib.sha512(b'keyforge.codeLab').digest()).decode()[:8]
for catalog in (dest / 'packages/keybr-intl/translations').glob('*.json'):
    messages = json.loads(catalog.read_text())
    messages['keyforge.codeLab'] = 'Code Lab'
    catalog.write_text(json.dumps(messages, ensure_ascii=False, indent=2) + '\n')
for catalog in (dest / 'packages/keybr-intl/lib/messages').glob('*.json'):
    messages = json.loads(catalog.read_text())
    messages[message_id] = [{'type': 0, 'value': 'Code Lab'}]
    catalog.write_text(json.dumps(messages, ensure_ascii=False, separators=(',', ':')) + '\n')
package = dest / 'package.json'
data = json.loads(package.read_text())
data['scripts']['precompile'] = 'node keyforge/prepare-build.mjs'
# tmp 0.2.7 fixes GHSA-7c78-jf6q-g5cm as well as the earlier path-traversal issue.
# Keep the rest of the pinned upstream dependency graph unchanged where possible.
data.setdefault('overrides', {})['tmp'] = '0.2.7'
package.write_text(json.dumps(data, indent=2) + '\n')
subprocess.run(['npm', 'install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'], cwd=dest, check=True)
(dest / 'verification').mkdir(exist_ok=True)
shutil.copyfile(dest / 'package-lock.json', dest / 'verification/resolved-package-lock.json')
print(f'KeyForge source ready at {dest}. No deployment or DNS change has occurred.')
