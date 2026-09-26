import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { writeFileSync, mkdirSync } from 'node:fs';
import WebSocket from 'ws';
import { ClientCodec } from '../packages/keybr-multiplayer-shared/lib/codec.client.ts';
import { GameState, GAME_CONFIG_ID, GAME_READY_ID, GAME_WORLD_ID, PLAYER_ANNOUNCE_ID, PLAYER_PROGRESS_ID } from '../packages/keybr-multiplayer-shared/lib/messages.ts';
const base = new URL(process.env.KEYFORGE_BASE_URL || 'http://127.0.0.1:10000');
const checks = [];
for (const path of ['/', '/typing-test', '/profile', '/code-lab', '/code-lab/index.html', '/multiplayer', '/healthz']) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  checks.push(`HTTP 200 ${path}`);
}
const health = await (await fetch(new URL('/healthz', base))).json();
assert.equal(health.transport, 'single-port');
assert.equal(health.accountsEnabled, false);
checks.push('Single-port runtime and hosted accounts disabled');
const statsUrl = new URL('/_/game/stats', base);
const before = await (await fetch(statsUrl)).json();
const url = new URL('/_/game/server', base);
url.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
const clients = [];
let error = null;
async function waitFor(test, label, timeout = 15000) {
  const end = Date.now() + timeout;
  while (!test()) {
    if (error) throw error;
    if (Date.now() > end) throw new Error(`Timeout: ${label}`);
    await delay(30);
  }
  checks.push(label);
}
try {
  for (let i = 0; i < 2; i++) {
    const client = { socket: new WebSocket(url, { origin: base.origin }), codec: new ClientCodec(), text: '', state: -1, world: null };
    clients.push(client);
    client.socket.on('error', e => { error = e; });
    client.socket.on('message', data => {
      try {
        const message = client.codec.decode(new Uint8Array(data));
        if (message.type === GAME_CONFIG_ID) client.text = message.text;
        if (message.type === GAME_READY_ID) client.state = message.gameState;
        if (message.type === GAME_WORLD_ID) client.world = message;
      } catch (e) { error = e; }
    });
    client.socket.on('open', () => client.socket.send(client.codec.encode({ type: PLAYER_ANNOUNCE_ID, signature: 0xdeadbabe })));
    await waitFor(() => client.socket.readyState === WebSocket.OPEN, `Racer ${i + 1} connected`);
  }
  await waitFor(() => clients.every(c => c.state === GameState.RUNNING && c.text.length), 'Two clients reached the running race');
  assert.equal(clients[0].text, clients[1].text);
  checks.push('Both clients received the same race text');
  const start = performance.now();
  for (const char of Array.from(clients[0].text)) {
    await delay(50);
    for (const client of clients) {
      client.socket.send(client.codec.encode({ type: PLAYER_PROGRESS_ID, elapsed: Math.round(performance.now() - start), codePoint: char.codePointAt(0) }));
    }
  }
  await waitFor(() => clients.every(c => c.state === GameState.FINISHED), 'Both clients completed the race');
  const states = [...clients[0].world.playerState.values()];
  assert.equal(states.filter(p => p.finished).length, 2);
  assert.deepEqual(states.map(p => p.position).sort(), [1, 2]);
  checks.push('Server recorded two finishers with distinct finishing positions');
  const after = await (await fetch(statsUrl)).json();
  assert.equal(after.gamesCompleted, before.gamesCompleted + 1);
  checks.push('Game completion counter increased once');
  const rejected = await new Promise((resolve, reject) => {
    const socket = new WebSocket(url, { origin: 'https://untrusted.example' });
    const timeout = setTimeout(() => { socket.terminate(); reject(new Error('Origin rejection timed out')); }, 5000);
    socket.on('unexpected-response', (_, response) => { clearTimeout(timeout); response.resume(); resolve(response.statusCode === 403); });
    socket.on('error', () => {});
    socket.on('open', () => { clearTimeout(timeout); socket.close(); resolve(false); });
  });
  assert(rejected);
  checks.push('Untrusted browser origin rejected');
  mkdirSync('verification', { recursive: true });
  writeFileSync('verification/render-race.json', JSON.stringify({ passed: checks.length, checks, health, note: 'Automated protocol test; generated speeds are not human benchmarks.' }, null, 2));
  console.log(JSON.stringify({ passed: checks.length, checks, health }, null, 2));
} finally {
  for (const client of clients) client.socket.close();
}
