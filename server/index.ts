import { createApp } from './app.js';
import { createMongoStore } from './mongo-store.js';

process.umask(0o077);
const production = process.env.NODE_ENV === 'production';
const originSetting =
  process.env.ALLOWED_ORIGINS ||
  (production
    ? 'https://jasonbreedlove.dev'
    : 'http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:3001,http://localhost:3001');
const allowedOrigins = originSetting
  .split(',')
  .map((value) => new URL(value.trim()).origin);
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0)
  throw new Error('TRUST_PROXY_HOPS must be a non-negative integer.');
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('PORT must be between 1 and 65535.');
const store = await createMongoStore();
const app = createApp({ store, production, allowedOrigins, trustProxyHops });
const host = process.env.HOST || '127.0.0.1';
const server = app.listen(port, host, () =>
  console.log(`Portfolio API: http://${host}:${port}`),
);
let closing = false;
function shutdown() {
  if (closing) return;
  closing = true;
  server.close(() => {
    store.close().then(
      () => process.exit(0),
      () => process.exit(1),
    );
  });
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
