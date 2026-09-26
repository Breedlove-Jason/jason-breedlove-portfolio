#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
export HUSKY=0
export DATABASE_CLIENT=sqlite
# Render can restore generated source from its build cache. Recreate only that
# verified directory; never overwrite user source or touch the persistent disk.
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
    if (marker.is_symlink() or not marker.is_file()
            or marker.read_text().strip() != 'e9c11fea284b8c861547173639580fe1442621b7'):
        raise SystemExit('Unrecognized build directory; clear Render build cache instead.')
    # Do not traverse a mounted disk, even if configuration changes later.
    mountinfo = Path('/proc/self/mountinfo')
    if mountinfo.exists():
        for line in mountinfo.read_text().splitlines():
            mount = Path(line.split()[4].replace(r'\040', ' ').replace(r'\134', '\\'))
            if mount == runtime or runtime in mount.parents:
                raise SystemExit('Refusing to clean a mounted filesystem.')
    # Only the verified generated source tree is recreated. /var/data is untouched.
    shutil.rmtree(runtime)
    print('Removed verified generated build cache; persistent storage untouched.')
PY
python3 keyforge/setup.py .keyforge-runtime
python3 .keyforge-runtime/keyforge/apply-render.py
cd .keyforge-runtime
npm ci --include=dev
npm run test:code-lab
npm run compile
npm run build -- --no-stats
