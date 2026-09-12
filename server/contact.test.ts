import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from './app.js';
import { createStore } from './store.js';

const valid = {
  name: 'Portfolio Test',
  email: 'test@example.com',
  subject: 'Engineering opportunity',
  message: 'This is an automated local contact form verification.',
  website: '',
};
function setup(
  t: TestContext,
  options: Partial<Parameters<typeof createApp>[0]> = {},
) {
  const store = createStore(':memory:');
  t.after(() => store.close());
  return createApp({
    store,
    allowedOrigins: ['http://localhost:5173'],
    ...options,
  });
}
test('persists the validated message durably and returns an ID', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'portfolio-contact-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const filename = join(dir, 'test.sqlite');
  const store = createStore(filename);
  const app = createApp({ store });
  const response = await request(app)
    .post('/api/contact')
    .send(valid)
    .expect(201);
  store.close();
  const db = new DatabaseSync(filename, { readOnly: true });
  const saved = db
    .prepare('SELECT * FROM contact_messages WHERE id = ?')
    .get(response.body.id);
  db.close();
  assert.ok(saved);
  assert.equal(saved.message, valid.message);
  assert.equal(saved.email, valid.email);
  assert.equal(saved.status, 'new');
  assert.match(response.headers['cache-control'], /no-store/);
});
test('rejects invalid email, short messages, multiline names, and extra fields', async (t) => {
  const app = setup(t, { maxRequests: 10 });
  for (const invalid of [
    { email: 'bad' },
    { message: 'short' },
    { name: 'Name\nInjected' },
    { admin: true },
  ]) {
    await request(app)
      .post('/api/contact')
      .send({ ...valid, ...invalid })
      .expect(422);
  }
});
test('allows configured origin and blocks foreign origins', async (t) => {
  const app = setup(t);
  await request(app)
    .post('/api/contact')
    .set('Origin', 'https://untrusted.example')
    .send(valid)
    .expect(403);
  await request(app)
    .post('/api/contact')
    .set('Origin', 'http://localhost:5173')
    .send(valid)
    .expect(201);
});
test('honeypot submissions never reach persistence', async (t) => {
  const app = setup(t, {
    store: {
      save() {
        assert.fail('Honeypot must not save');
      },
    },
  });
  await request(app)
    .post('/api/contact')
    .send({ ...valid, website: 'spam.example' })
    .expect(200);
});
test('rate limits repeated requests', async (t) => {
  const app = setup(t, { maxRequests: 1 });
  await request(app).post('/api/contact').send(valid).expect(201);
  const result = await request(app)
    .post('/api/contact')
    .send(valid)
    .expect(429);
  assert.ok(result.headers['retry-after']);
});
test('rejects malformed JSON, wrong media types, oversized bodies, and wrong method', async (t) => {
  const app = setup(t, { maxRequests: 10 });
  await request(app)
    .post('/api/contact')
    .set('Content-Type', 'application/json')
    .send('{')
    .expect(400);
  await request(app).post('/api/contact').type('form').send(valid).expect(415);
  await request(app)
    .post('/api/contact')
    .send({ ...valid, message: 'a'.repeat(25000) })
    .expect(413);
  await request(app).get('/api/contact').expect(405);
});
test('does not claim success when persistence fails', async (t) => {
  const app = setup(t, {
    store: {
      save() {
        throw new Error('simulated disk failure');
      },
    },
  });
  const result = await request(app)
    .post('/api/contact')
    .send(valid)
    .expect(503);
  assert.match(result.body.error, /could not be saved/);
  assert.ok(!JSON.stringify(result.body).includes('simulated disk failure'));
});
