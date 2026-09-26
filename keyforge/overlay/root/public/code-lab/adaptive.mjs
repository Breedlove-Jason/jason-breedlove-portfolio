/* KeyForge continuous refinement. Copyright 2026 Jason Breedlove.
 * AGPL-3.0-or-later. Local, deterministic given a seed; never executes code.
 */
import { Session } from './engine.mjs';
import { snippets, seeded } from './lessons.mjs';

// An allowlist avoids retaining arbitrary identifiers from pasted source.
export const FRAGMENTS = Object.freeze(['=>', '===', '!==', '==', '!=', '&&', '||', '??', '?.', '+=', '-=', '*=', '/=', '**', '++', '--', '->', '::', '</', '/>', '${', '()', '[]', '{}', ');', ');\n', '\n  ', '\n    ', 'const ', 'let ', 'return ', 'if (', 'for (', 'async ', 'await ', 'def ', 'self.', 'import ', 'from ', '.map(', '.filter(', 'print(', 'SELECT ', 'FROM ', 'WHERE ', 'git ', 'npm ', 'public ', 'static ', 'fn ', 'func ', 'type ', 'class ', 'export ', 'throw ', 'try {', 'catch (']);
const endings = new Map();
for (const token of FRAGMENTS) {
  const list = endings.get(token.at(-1)) ?? [];
  list.push(token); endings.set(token.at(-1), list);
}

export class AdaptiveSession extends Session {
  constructor(text, options = {}) {
    super(text, options);
    this.captureFragments = options.captureFragments !== false;
    this.fragments = Object.create(null);
    this.positions = new Map();
    this.reported = new Set();
    this.epoch = 0;
  }
  type(char, now) {
    const position = this.cursor;
    const result = super.type(char, now);
    if (!result.accepted || !this.captureFragments) return result;
    const point = this.positions.get(position) ?? { time: now, error: false, epoch: this.epoch };
    point.error ||= !result.correct;
    this.positions.set(position, point);
    for (const token of endings.get(result.expected) ?? []) {
      const start = position - token.length + 1;
      const id = `${start}:${token}`;
      if (start < 0 || this.reported.has(id) || this.target.slice(start, position + 1).join('') !== token) continue;
      const points = Array.from({ length: token.length }, (_, i) => this.positions.get(start + i));
      if (points.some(p => !p)) continue;
      this.reported.add(id);
      const stats = this.fragments[token] ??= { count: 0, errors: 0, latency: 0, samples: 0 };
      stats.count++;
      stats.errors += Number(points.some(p => p.error));
      const interval = (now - points[0].time) / (token.length - 1);
      // Interrupted/retyped spans retain errors, but cannot look artificially fast.
      if (points.every(p => p.epoch === this.epoch) && interval > 0 && interval <= 5000) {
        stats.latency += interval; stats.samples++;
      }
    }
    return result;
  }
  backspace(now) {
    const changed = super.backspace(now);
    if (changed) this.epoch++;
    return changed;
  }
  pause(now) { super.pause(now); this.epoch++; }
  record(meta, now) { return { ...super.record(meta, now), fragments: this.fragments }; }
}

const median = numbers => {
  const sorted = [...numbers].sort((a, b) => a - b);
  const i = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2;
};
export function paceTarget(history, options) {
  const rows = history.filter(r => r.language === options.language && r.drill === options.drill
    && r.level === options.level && r.limit === options.seconds && r.policy === options.policy
    && r.reason !== 'strict-failed' && r.metrics.seconds >= 8 && r.metrics.correct >= 20)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 8);
  if (rows.length < 3) return { wpm: null, state: 'calibrating', samples: rows.length };
  const clean = rows.slice(0, 3).every(r => r.metrics.accuracy >= 98);
  const baseline = median(rows.map(r => r.metrics.wpm));
  // No graduation, no fixed top speed, and no ratchet based on one lucky burst.
  return { wpm: Math.max(1, Math.round(baseline * (clean ? 1.03 : 0.95))),
    state: clean ? 'stretch' : 'accuracy', samples: rows.length };
}

export function skillProfile(history, { language, goal = 40, now = Date.now() } = {}) {
  const map = new Map();
  const rows = history.filter(r => r.language === language && r.drill !== 'custom')
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 80);
  rows.forEach((row, index) => {
    const weight = Math.pow(0.9, index);
    // Prefer contiguous allowlisted fragment measurements over legacy pairs.
    const groups = [row.keys ?? {}, { ...row.pairs, ...row.fragments }];
    for (const group of groups) for (const [token, stats] of Object.entries(group)) {
      const item = map.get(token) ?? { token, count: 0, errors: 0, samples: 0, latency: 0, observations: 0, lastSeen: 0 };
      item.observations += stats.count;
      for (const field of ['count', 'errors', 'samples', 'latency']) item[field] += stats[field] * weight;
      item.lastSeen = Math.max(item.lastSeen, Date.parse(row.date));
      map.set(token, item);
    }
  });
  return [...map.values()].map(item => {
    const errorRate = item.count ? item.errors / item.count : 0;
    const latency = item.samples ? item.latency / item.samples : null;
    const known = item.observations >= (Array.from(item.token).length === 1 ? 5 : 3);
    const speedGap = latency === null ? 0 : Math.max(0, latency / (12000 / Math.max(1, goal)) - 1);
    const due = Math.min(1, Math.max(0, now - item.lastSeen) / (7 * 86400000));
    return { ...item, errorRate, meanLatency: latency, known, due,
      priority: errorRate * 10 + Math.min(3, speedGap) + due * 0.5,
      bucket: !known ? 'explore' : errorRate > 0.02 || speedGap > 0.1 ? 'repair' : 'review' };
  }).sort((a, b) => b.priority - a.priority);
}

function weightedPick(items, rng, score) {
  const weights = items.map(item => Math.max(0.05, score(item)));
  let offset = rng() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < items.length; i++) { offset -= weights[i]; if (offset < 0) return items[i]; }
  return items.at(-1);
}
export function makeRefinementLesson(options = {}, history = []) {
  const { language = 'JavaScript', level = 'foundation', seconds = 0, policy = 'stop', goal = 40,
    seed = String(Math.random()), now = Date.now() } = options;
  const pace = paceTarget(history, { language, level, seconds, policy, drill: 'weak' });
  const pool = snippets[language] ?? snippets.JavaScript;
  const corpus = (level === 'foundation' ? pool.slice(0, 2) : pool).map(row => row[1]).join('\n');
  const lines = corpus.split('\n').filter(line => line.trim().length >= 3);
  const profile = skillProfile(history, { language, goal: pace.wpm ?? goal, now });
  const prior = new Map(profile.map(item => [item.token, item]));
  const available = [...new Set([...Array.from(corpus), ...FRAGMENTS.filter(token => corpus.includes(token)),
    ...profile.map(item => item.token)])];
  const candidates = available.filter(token => token.length > 0).map(token => prior.get(token)
    ?? { token, observations: 0, priority: 1, due: 1, bucket: 'explore' });
  const groups = Object.fromEntries(['repair', 'review', 'explore'].map(bucket => [bucket, candidates.filter(item => item.bucket === bucket)]));
  const rng = seeded(seed);
  // A complete cycle is 60% repair, 25% retention, 15% exploration when available.
  // Empty buckets fall back to eligible material instead of ending the course.
  const schedule = [...Array(12).fill('repair'), ...Array(5).fill('review'), ...Array(3).fill('explore')];
  for (let i = schedule.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [schedule[i], schedule[j]] = [schedule[j], schedule[i]]; }
  const selected = [], exposure = new Map();
  const blocks = schedule.map(bucket => {
    const choices = groups[bucket].length ? groups[bucket] : candidates;
    const item = weightedPick(choices, rng, skill => (bucket === 'repair' ? skill.priority + 0.2 : 1 + skill.due)
      / (1 + (exposure.get(skill.token) ?? 0)));
    exposure.set(item.token, (exposure.get(item.token) ?? 0) + 1);
    selected.push({ token: item.token, bucket: item.bucket, requested: bucket });
    const context = lines.filter(line => line.includes(item.token));
    if (context.length) return context[Math.floor(rng() * context.length)];
    // Newlines and indentation stay trainable, not discarded as empty tokens.
    const position = corpus.indexOf(item.token);
    if (item.token.includes('\n') && position >= 0) {
      const from = Math.max(0, corpus.lastIndexOf('\n', Math.max(0, position - 1)) + 1);
      const end = corpus.indexOf('\n', position + item.token.length);
      return corpus.slice(from, end < 0 ? corpus.length : end);
    }
    return `${item.token} ${item.token} ${item.token}`;
  });
  let text = blocks.join('\n');
  if (seconds) { const base = text; while (text.length < 24000) text += '\n' + base; }
  return { text, title: 'Continuous refinement · keys + fragments', language, level, seconds, drill: 'weak',
    adaptation: { pace, targets: selected, retained: groups.review.length,
      focus: [...new Set(selected.filter(item => item.requested === 'repair').map(item => item.token))].slice(0, 5) } };
}
