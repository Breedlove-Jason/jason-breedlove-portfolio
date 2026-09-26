#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
export HUSKY=0
export DATABASE_CLIENT=sqlite
# Render may restore dependencies without their generated parent source tree.
# Recreate only verified generated source or a dependency-only cache.
python3 - <<'PY'
from pathlib import Path
import shutil

root = Path.cwd().resolve()
runtime = root / '.keyforge-runtime'
if runtime.is_symlink():
    raise SystemExit('Refusing to replace a symlinked build directory.')
if runtime.exists():
    if not runtime.is_dir() or runtime.resolve().parent != root:
        raise SystemExit('Unexpected build directory; refusing cleanup.')
    marker = runtime / 'UPSTREAM_COMMIT'
    verified_source = (not marker.is_symlink() and marker.is_file()
        and marker.read_text().strip() == 'e9c11fea284b8c861547173639580fe1442621b7')
    # Do not traverse a mounted disk, even if configuration changes later.
    mountinfo = Path('/proc/self/mountinfo')
    if mountinfo.exists():
        for line in mountinfo.read_text().splitlines():
            mount = Path(line.split()[4].replace(r'\040', ' ').replace(r'\134', '\\'))
            if mount == runtime or runtime in mount.parents:
                raise SystemExit('Refusing to clean a mounted filesystem.')
    # Cache restoration can include node_modules in nested workspace packages.
    def dependencies_only(directory):
        for item in directory.iterdir():
            if item.is_symlink() or not item.is_dir():
                return False
            if item.name != 'node_modules' and not dependencies_only(item):
                return False
        return True
    if not (verified_source or dependencies_only(runtime)):
        raise SystemExit('Unrecognized build directory; clear Render build cache instead.')
    # Only generated build inputs are recreated. /var/data is never touched.
    shutil.rmtree(runtime)
    print('Removed disposable build cache; persistent storage untouched.')
PY
python3 keyforge/setup.py .keyforge-runtime
python3 .keyforge-runtime/keyforge/apply-render.py
cd .keyforge-runtime
npm ci --include=dev
npm run test:code-lab
npm run compile
npm run build -- --no-stats
