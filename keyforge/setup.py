#!/usr/bin/env python3
"""Reconstruct the full KeyForge fork without changing the portfolio project."""
from pathlib import Path
import argparse
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
package = dest / 'package.json'
data = json.loads(package.read_text())
data['scripts']['precompile'] = 'node keyforge/prepare-build.mjs'
package.write_text(json.dumps(data, indent=2) + '\n')
print(f'KeyForge source ready at {dest}. No deployment or DNS change has occurred.')
