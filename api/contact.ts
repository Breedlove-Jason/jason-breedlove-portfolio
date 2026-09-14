import { createApp } from '../server/app.js';
import { createMongoStore } from '../server/mongo-store.js';

let storePromise: ReturnType<typeof createMongoStore> | undefined;

function getStore() {
  if (!storePromise) {
    storePromise = createMongoStore().catch((error) => {
      storePromise = undefined;
      throw error;
    });
  }

  return storePromise;
}

const allowedOrigins = [
  'https://jasonbreedlove.dev',
  'https://www.jasonbreedlove.dev',
];

for (const hostname of [
  process.env.VERCEL_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
]) {
  if (hostname) allowedOrigins.push(`https://${hostname}`);
}

export default createApp({
  production: true,
  trustProxyHops: 1,
  allowedOrigins,
  store: {
    async save(data) {
      const store = await getStore();
      return store.save(data);
    },
  },
});