/* Lage reads Git metadata even with its cache disabled. Archives lack it.
 * Create empty local metadata only when this project has no .git directory.
 * No source files, secrets, remotes, or credentials are committed.
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
if (!existsSync(new URL('../.git', import.meta.url))) {
  for (const args of [
    ['init'],
    ['-c', 'user.name=KeyForge Build', '-c', 'user.email=build@localhost', '-c', 'core.hooksPath=/dev/null', 'commit', '--allow-empty', '-m', 'Initialize local build metadata'],
  ]) {
    const result = spawnSync('git', args, { cwd: root, stdio: 'inherit' });
    if (result.error || result.status !== 0) {
      console.error('Git is required by the upstream build tool.', result.error ?? '');
      process.exit(1);
    }
  }
}
