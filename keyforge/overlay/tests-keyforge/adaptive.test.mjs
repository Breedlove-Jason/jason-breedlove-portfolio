import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AdaptiveSession, makeRefinementLesson, skillProfile, paceTarget, FRAGMENTS } from '../root/public/code-lab/adaptive.mjs';
import { parseBackup, VERSION } from '../root/public/code-lab/engine.mjs';
import { LANGUAGES } from '../root/public/code-lab/lessons.mjs';
const opts = { language: 'JavaScript', drill: 'weak', level: 'fluent', seconds: 0, policy: 'stop', goal: 40 };
const meta = { ...opts, title: 'Test' };
function record(text = 'const x = () => {};', options = {}) {
  const s = new AdaptiveSession(text, options);
  Array.from(text).forEach((c, i) => s.type(c, i * 200));
  return s.record(meta, 50000);
}
function result(wpm = 80, accuracy = 100, date = Date.now()) {
  const r = record(); r.metrics = { ...r.metrics, wpm, accuracy, seconds: 30, correct: 200 };
  r.date = new Date(date).toISOString(); return r;
}
test('allowlisted multi-character fragments are measured, not arbitrary source', () => {
  const row = record('const secretIdentifier = () => {};');
  assert.equal(row.fragments['const '].count, 1);
  assert.equal(row.fragments['=>'].count, 1);
  assert.ok(!('secretIdentifier' in row.fragments));
  assert.equal(row.fragments['const '].latency, 200);
});
test('fragment errors survive corrections and cannot be counted twice', () => {
  const s = new AdaptiveSession('=>x', { policy: 'correct' });
  s.type('=', 0); s.type('x', 100); s.backspace(200); s.type('>', 300); s.type('x', 400);
  assert.equal(s.fragments['=>'].count, 1); assert.equal(s.fragments['=>'].errors, 1);
});
test('stop-on-error records a fragment error even when fixed before completion', () => {
  const s = new AdaptiveSession('=>');
  s.type('x', 0); s.type('=', 100); s.type('>', 200);
  assert.equal(s.fragments['=>'].errors, 1);
});
test('paused fragments do not gain misleading timing samples', () => {
  const s = new AdaptiveSession('=>'); s.type('=', 0); s.pause(100); s.resume(5000); s.type('>', 5100);
  assert.equal(s.fragments['=>'].count, 1); assert.equal(s.fragments['=>'].samples, 0);
});
test('custom code can opt out of longer fragment retention', () => assert.deepEqual(Object.keys(record('const token = 1;', { captureFragments: false }).fragments), []));
test('extended telemetry survives backup round trip; legacy v1 is accepted', () => {
  const row = record(); assert.equal(parseBackup(JSON.stringify({ version: VERSION, history: [row] }))[0].fragments['=>'].count, 1);
  delete row.fragments; assert.equal(parseBackup(JSON.stringify({ version: VERSION, history: [row] })).length, 1);
});
test('malformed optional fragment telemetry is rejected', () => {
  const row = record(); row.fragments = { '=>': { count: 1, errors: 2, samples: 1, latency: 100 } };
  assert.throws(() => parseBackup(JSON.stringify({ version: VERSION, history: [row] })));
});
test('all fluent tracks keep generating after curriculum completion', () => {
  for (const language of LANGUAGES) {
    const lesson = makeRefinementLesson({ ...opts, language, seed: 'finished' }, []);
    assert.ok(lesson.text.length > 40); assert.equal(lesson.adaptation.targets.length, 20);
  }
});
test('refinement reserves all three types of practice and never empties', () => {
  const lesson = makeRefinementLesson({ ...opts, seed: 'mix' }, Array.from({ length: 10 }, () => record()));
  assert.equal(lesson.adaptation.targets.filter(t => t.requested === 'repair').length, 12);
  assert.equal(lesson.adaptation.targets.filter(t => t.requested === 'review').length, 5);
  assert.equal(lesson.adaptation.targets.filter(t => t.requested === 'explore').length, 3);
});
test('accurate mastered keys remain in the review pool', () => {
  const history = Array.from({ length: 8 }, () => record());
  const profile = skillProfile(history, { language: 'JavaScript', goal: 40 });
  assert.ok(profile.find(s => s.token === '=' && s.bucket === 'review'));
  assert.ok(makeRefinementLesson({ ...opts, seed: 'retention' }, history).adaptation.retained > 0);
});
test('latest errors outweigh old errors of equal sample count', () => {
  const now = Date.now();
  const old = result(40, 98, now - 1000), recent = result(40, 98, now);
  old.keys = { a: { count: 10, errors: 5, samples: 5, latency: 1000 }, b: { count: 10, errors: 0, samples: 5, latency: 1000 } };
  recent.keys = { a: { count: 10, errors: 0, samples: 5, latency: 1000 }, b: { count: 10, errors: 5, samples: 5, latency: 1000 } };
  const p = skillProfile([old, recent], { language: 'JavaScript', now });
  assert.ok(p.find(s => s.token === 'b').priority > p.find(s => s.token === 'a').priority);
});
test('fresh seeds vary fragments without changing an active lesson', () => {
  const a = makeRefinementLesson({ ...opts, seed: 'a' }), b = makeRefinementLesson({ ...opts, seed: 'b' });
  assert.notEqual(a.text, b.text); assert.equal(a.text, makeRefinementLesson({ ...opts, seed: 'a' }).text);
});
test('pace needs three sufficiently long comparable sessions', () => {
  assert.equal(paceTarget([result(), result()], opts).wpm, null);
  assert.equal(paceTarget(Array.from({ length: 3 }, () => ({ ...result(), language: 'Python' })), opts).wpm, null);
});
test('pace can exceed 200 WPM and backs off when accuracy drops', () => {
  assert.equal(paceTarget(Array.from({ length: 3 }, () => result(250)), opts).wpm, 258);
  const reset = paceTarget(Array.from({ length: 3 }, () => result(80, 93)), opts);
  assert.equal(reset.wpm, 76); assert.equal(reset.state, 'accuracy');
});
test('timed refinement maintains the full text runway', () => assert.ok(makeRefinementLesson({ ...opts, seconds: 120 }).text.length >= 24000));
test('a new language never inherits another language profile', () => assert.equal(skillProfile([record()], { language: 'Python' }).length, 0));

test('previously observed keys outside the current snippet pool remain eligible', () => {
  const r = record();
  r.keys = { '@': { count: 100, errors: 50, samples: 20, latency: 10000 } };
  r.pairs = {}; r.fragments = {};
  const lesson = makeRefinementLesson({ ...opts, seed: 'outside-corpus' }, [r]);
  assert.ok(lesson.adaptation.targets.some(t => t.token === '@'));
  assert.ok(lesson.text.includes('@'));
});
test('measured newline fragments are eligible and appear in generated practice', () => {
  const r = record(); r.keys = {}; r.pairs = {};
  r.fragments = { '\n  ': { count: 100, errors: 50, samples: 10, latency: 6000 } };
  const lesson = makeRefinementLesson({ ...opts, seed: 'whitespace' }, [r]);
  assert.ok(lesson.adaptation.targets.some(t => t.token === '\n  '));
  assert.ok(lesson.text.includes('\n  '));
});
