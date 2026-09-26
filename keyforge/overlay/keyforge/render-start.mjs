/** Configure the Render runtime before loading the bundled application. */
import { accessSync, constants, mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
const env = process.env;
const diskRoot = resolve(env.KEYFORGE_DISK_PATH || '/var/data');
let persistent = false;
try {
  persistent = readFileSync('/proc/self/mountinfo', 'utf8').split('\n')
    .some(line => line.split(' ')[4] === diskRoot);
  if (persistent) accessSync(diskRoot, constants.W_OK);
} catch { persistent = false; }
if (!persistent && env.KEYFORGE_ALLOW_EPHEMERAL_PREVIEW !== 'true') {
  throw new Error('Attach the 1 GB persistent disk at /var/data before starting production.');
}
if (!persistent && env.KEYFORGE_ACCOUNTS_ENABLED === 'true') {
  throw new Error('Hosted accounts cannot run on temporary preview storage.');
}
const base = new URL(env.APP_URL || env.RENDER_EXTERNAL_URL || 'http://127.0.0.1:10000/');
if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password) {
  throw new Error('APP_URL must be a credential-free HTTP(S) origin.');
}
env.NODE_ENV = 'production';
env.KEYFORGE_SINGLE_PORT = 'true';
env.KEYFORGE_STORAGE_MODE = persistent ? 'persistent' : 'temporary-preview';
env.KEYFORGE_ACCOUNTS_ENABLED ||= 'false';
env.APP_URL = base.origin + '/';
env.COOKIE_DOMAIN = base.hostname;
env.COOKIE_SECURE = String(base.protocol === 'https:');
env.COOKIE_NAME = 'keyforge_session';
env.DATABASE_CLIENT = 'sqlite';
env.DATA_DIR = persistent ? join(diskRoot, 'keyforge') : '/tmp/keyforge-preview';
env.DATABASE_FILENAME = join(env.DATA_DIR, 'database.sqlite');
env.MAIL_DOMAIN ||= 'localhost';
env.MAIL_KEY ||= '';
mkdirSync(env.DATA_DIR, { recursive: true });
console.info(`KeyForge storage: ${env.KEYFORGE_STORAGE_MODE}; hosted accounts: ${env.KEYFORGE_ACCOUNTS_ENABLED}`);
const migration = spawnSync('npm', ['run', 'db:init'], { env, stdio: 'inherit' });
if (migration.error || migration.status !== 0) {
  throw new Error('Database initialization failed; server was not started.');
}
createRequire(import.meta.url)('../root/index.js');
