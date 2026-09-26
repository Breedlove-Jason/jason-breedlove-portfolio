/* KeyForge Code Lab. Copyright 2026 Jason Breedlove. AGPL-3.0-or-later.
 * Pure timing/scoring engine. Callers supply a monotonic clock in milliseconds.
 */
export const VERSION = 1;
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
export const mean = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
export function category(char) {
  if (/\s/u.test(char)) return 'whitespace';
  if (/[0-9]/u.test(char)) return 'numbers';
  if (/[a-zA-Z]/u.test(char)) return 'letters';
  return 'symbols';
}
export function consistency(intervals) {
  if (intervals.length < 3) return null;
  const avg = mean(intervals);
  if (!avg) return 100;
  return clamp(100 * (1 - Math.sqrt(mean(intervals.map(n => (n - avg) ** 2))) / avg), 0, 100);
}
export class Session {
  constructor(text, { seconds = 0, policy = 'stop' } = {}) {
    if (typeof text !== 'string' || !text.length || text.length > 100000) throw new TypeError('Lesson must contain 1 to 100,000 characters.');
    if (!Number.isFinite(seconds) || seconds < 0 || seconds > 600) throw new TypeError('Invalid time limit.');
    if (!['stop', 'correct', 'strict'].includes(policy)) throw new TypeError('Invalid error policy.');
    this.target = Array.from(text.replace(/\r\n?/g, '\n'));
    this.seconds = seconds;
    this.policy = policy;
    this.input = [];
    this.attempts = 0;
    this.mistakes = 0;
    this.backspaces = 0;
    this.started = null;
    this.ended = null;
    this.pausedAt = null;
    this.pauseMs = 0;
    this.lastKeyAt = null;
    this.lastExpected = null;
    this.reason = null;
    this.keys = Object.create(null);
    this.pairs = Object.create(null);
    this.intervals = [];
    this.samples = [];
  }
  get cursor() { return this.input.length; }
  get done() { return this.ended !== null; }
  elapsed(now) {
    if (this.started === null) return 0;
    const end = this.ended ?? this.pausedAt ?? now;
    return Math.max(0, end - this.started - this.pauseMs) / 1000;
  }
  checkTime(now) {
    if (!this.done && this.started !== null && this.seconds && this.elapsed(now) >= this.seconds) {
      this.finish('time', this.started + this.pauseMs + this.seconds * 1000);
    }
    return this.done;
  }
  pause(now) {
    // Benchmarks never pause: background tabs and lost focus still consume time.
    if (!this.seconds && !this.done && this.started !== null && this.pausedAt === null) {
      this.pausedAt = now;
      this.lastKeyAt = null;
      this.lastExpected = null;
    }
  }
  resume(now) {
    if (this.pausedAt !== null) {
      this.pauseMs += Math.max(0, now - this.pausedAt);
      this.pausedAt = null;
    }
  }
  type(char, now) {
    if (Array.from(char).length !== 1) throw new TypeError('Enter one character at a time.');
    if (this.checkTime(now) || this.cursor >= this.target.length) return { accepted: false };
    this.resume(now);
    if (this.started === null) this.started = now;
    const expected = this.target[this.cursor];
    const correct = char === expected;
    const key = this.keys[expected] ??= { count: 0, errors: 0, latency: 0, samples: 0 };
    key.count++;
    this.attempts++;
    if (!correct) { key.errors++; this.mistakes++; }
    if (this.lastKeyAt !== null) {
      const delta = Math.max(0, now - this.lastKeyAt);
      if (delta > 0) {
        this.intervals.push(delta);
        key.latency += delta;
        key.samples++;
        const pairName = `${this.lastExpected}${expected}`;
        const pair = this.pairs[pairName] ??= { count: 0, errors: 0, latency: 0, samples: 0 };
        pair.count++;
        pair.errors += correct ? 0 : 1;
        pair.latency += delta;
        pair.samples++;
      }
    }
    this.lastKeyAt = now;
    this.lastExpected = expected;
    if (correct || this.policy === 'correct') this.input.push(char);
    if (!correct && this.policy === 'strict') this.finish('strict-failed', now);
    else if (this.cursor === this.target.length && this.input.every((c, i) => c === this.target[i])) this.finish('completed', now);
    return { accepted: true, correct, expected };
  }
  backspace(now) {
    if (this.checkTime(now) || !this.input.length) return false;
    this.resume(now);
    this.input.pop();
    this.backspaces++;
    this.lastKeyAt = null;
    this.lastExpected = null;
    return true;
  }
  finish(reason, now) {
    if (this.done || this.started === null) return;
    this.resume(now);
    this.ended = now;
    this.reason = reason;
  }
  metrics(now) {
    const duration = this.elapsed(now);
    const correct = this.input.reduce((n, c, i) => n + Number(c === this.target[i]), 0);
    const minutes = duration / 60;
    return {
      seconds: duration,
      wpm: minutes > 0 ? correct / 5 / minutes : 0,
      rawWpm: minutes > 0 ? this.attempts / 5 / minutes : 0,
      cpm: minutes > 0 ? correct / minutes : 0,
      accuracy: this.attempts ? 100 * (this.attempts - this.mistakes) / this.attempts : 100,
      consistency: consistency(this.intervals),
      correct, attempts: this.attempts, errors: this.mistakes, backspaces: this.backspaces,
      progress: this.cursor / this.target.length * 100,
    };
  }
  sample(now) {
    if (this.started === null || this.done) return;
    const m = this.metrics(now);
    if (!this.samples.length || m.seconds - this.samples.at(-1)[0] >= 1) {
      this.samples.push([Math.round(m.seconds), Math.round(m.wpm)]);
    }
  }
  record(meta, now) {
    if (!this.done) throw new Error('Only completed or expired sessions can be saved.');
    const metrics = this.metrics(now);
    const stride = Math.max(1, Math.ceil(this.samples.length / 40));
    const pairs = Object.fromEntries(Object.entries(this.pairs).sort((a, b) => b[1].count - a[1].count).slice(0, 40));
    return {
      ...meta,
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: new Date().toISOString(), metrics,
      policy: this.policy, limit: this.seconds, reason: this.reason,
      keys: this.keys, pairs,
      samples: this.samples.filter((_, i) => i % stride === 0),
    };
  }
}
export function aggregateKeys(history) {
  const total = Object.create(null);
  for (const row of history) for (const [char, stats] of Object.entries(row.keys)) {
    const item = total[char] ??= { count: 0, errors: 0, latency: 0, samples: 0 };
    for (const field of ['count', 'errors', 'latency', 'samples']) item[field] += stats[field];
  }
  return total;
}
export function weakKeys(history) {
  return Object.entries(aggregateKeys(history)).filter(([, k]) => k.count >= 5)
    .sort((a, b) => (b[1].errors / b[1].count) - (a[1].errors / a[1].count)
      || (b[1].latency / Math.max(1, b[1].samples)) - (a[1].latency / Math.max(1, a[1].samples)))
    .map(([char]) => char);
}
const finite = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;
function validateStats(map, maxKeyLength) {
  return map && typeof map === 'object' && !Array.isArray(map) && Object.keys(map).length <= 400
    && Object.entries(map).every(([key, stats]) => key.length >= 1 && key.length <= maxKeyLength
      && stats && ['count', 'errors', 'latency', 'samples'].every(f => finite(stats[f]))
      && stats.errors <= stats.count && stats.count < 1e7 && stats.latency < 1e12);
}
export function validateRecord(r) {
  return !!r && typeof r.id === 'string' && r.id.length <= 100
    && typeof r.date === 'string' && Number.isFinite(Date.parse(r.date))
    && ['language', 'drill', 'level', 'title'].every(f => typeof r[f] === 'string' && r[f].length <= 200)
    && ['completed', 'time', 'strict-failed'].includes(r.reason)
    && ['stop', 'correct', 'strict'].includes(r.policy)
    && finite(r.limit) && r.limit <= 600
    && r.metrics && ['seconds', 'wpm', 'rawWpm', 'cpm', 'accuracy', 'correct', 'attempts', 'errors', 'backspaces', 'progress'].every(f => finite(r.metrics[f]))
    && r.metrics.accuracy <= 100 && r.metrics.progress <= 100 && r.metrics.errors <= r.metrics.attempts
    && (r.metrics.consistency === null || (finite(r.metrics.consistency) && r.metrics.consistency <= 100))
    && validateStats(r.keys, 2) && validateStats(r.pairs, 4)
    && Array.isArray(r.samples) && r.samples.length <= 100
    && r.samples.every(s => Array.isArray(s) && s.length === 2 && s.every(finite));
}
export function parseBackup(text) {
  if (typeof text !== 'string' || text.length > 4_000_000) throw new Error('Backup is too large (4 MB maximum).');
  const value = JSON.parse(text);
  if (value?.version !== VERSION || !Array.isArray(value.history) || value.history.length > 200 || !value.history.every(validateRecord)) {
    throw new Error('This is not a valid Code Lab v1 backup. Existing data was not changed.');
  }
  return value.history;
}
export function mergeHistory(a, b) {
  const rows = new Map(a.map(r => [r.id, r]));
  for (const r of b) if (!rows.has(r.id)) rows.set(r.id, r);
  return [...rows.values()].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 200);
}
export function csv(history) {
  const header = ['date', 'language', 'drill', 'level', 'policy', 'time_limit', 'result', 'wpm', 'raw_wpm', 'accuracy', 'consistency', 'seconds', 'errors', 'backspaces'];
  const escape = value => {
    let s = String(value ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [header, ...history.map(r => [r.date, r.language, r.drill, r.level, r.policy, r.limit, r.reason, r.metrics.wpm.toFixed(2), r.metrics.rawWpm.toFixed(2), r.metrics.accuracy.toFixed(2), r.metrics.consistency?.toFixed(2) ?? '', r.metrics.seconds.toFixed(2), r.metrics.errors, r.metrics.backspaces])].map(row => row.map(escape).join(',')).join('\r\n');
}
