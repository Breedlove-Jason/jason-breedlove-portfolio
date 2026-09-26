#!/usr/bin/env python3
"""Checked source edits for continuous Code Lab refinement; no hosting or DNS writes."""
from pathlib import Path
root = Path(__file__).resolve().parents[1]
lab = root / 'root/public/code-lab'
def replace(path, old, new):
    text = path.read_text()
    if new in text:
        return
    if text.count(old) != 1:
        raise SystemExit(f'Expected one integration anchor in {path}: {old[:70]!r}')
    path.write_text(text.replace(old, new, 1))
replace(lab / 'lessons.mjs', 'const snippets = {', 'export const snippets = {')
replace(lab / 'lessons.mjs', "['weak', 'Weak-key repair', 'Practice your least accurate characters.', '⌁']", "['weak', 'Continuous refinement', 'Keep improving keys and fragments, including mastered skills.', '⌁']")
replace(lab / 'engine.mjs', '&& validateStats(r.keys, 2) && validateStats(r.pairs, 4)', '&& validateStats(r.keys, 2) && validateStats(r.pairs, 4)\n    && (r.fragments === undefined || validateStats(r.fragments, 16))')
app = lab / 'app.mjs'
replace(app, "const $ = selector => document.querySelector(selector);", "import { AdaptiveSession, makeRefinementLesson, skillProfile } from './adaptive.mjs';\nconst $ = selector => document.querySelector(selector);")
replace(app, "options.goal >= 10 && options.goal <= 200", "options.goal >= 1 && Number.isSafeInteger(options.goal)")
replace(app, 'min="10" max="200" step="5"', 'min="1" step="1"')
replace(app, "prefs.goal = Math.min(200, Math.max(10, Number(event.target.value) || 40));", "const requested = Number(event.target.value); prefs.goal = Number.isSafeInteger(requested) && requested >= 1 ? requested : 40;")
replace(app, "if (!retry || !lesson) lesson = makeLesson({ ...prefs, custom, weak: weakKeys(history.filter(r => r.language === prefs.language)) });", "if (!retry || !lesson) lesson = prefs.drill === 'weak'\n    ? makeRefinementLesson(prefs, history)\n    : makeLesson({ ...prefs, custom, weak: weakKeys(history.filter(r => r.language === prefs.language)) });")
replace(app, "session = new Session(lesson.text, { seconds: lesson.seconds, policy: prefs.policy });", "session = new AdaptiveSession(lesson.text, { seconds: lesson.seconds, policy: prefs.policy, captureFragments: prefs.drill !== 'custom' });")
old = """    $('#coach-title').textContent = weakness.length ? 'Practice follows your evidence.' : 'Let’s learn your keyboard first.';
    $('#coach-text').textContent = weakness.length ? `Today’s repair keys: ${weakness.slice(0, 6).map(showKey).join(', ')}. Ranked by error rate, then latency; at least five observations per key.` : 'Complete a few sessions to identify weak keys. These starter drills are calibration, not a diagnosis.';"""
new = """    const plan = lesson.adaptation;
    const pace = plan?.pace;
    $('#coach-title').textContent = pace?.wpm ? `${pace.wpm} WPM suggested · ${pace.state === 'stretch' ? 'gentle stretch' : 'accuracy reset'}` : 'Continuous refinement · calibrating your pace';
    $('#coach-text').textContent = `Focus: ${(plan?.focus ?? weakness.slice(0, 5)).map(showKey).join(' · ')}. Keys never retire. Each cycle reserves repair, retention, and exploration slots; missing groups use available practice. ${pace?.wpm ? 'Suggestion, not a pass/fail threshold.' : 'Three matching sessions of at least eight seconds establish a pace suggestion.'}`;"""
replace(app, old, new)
replace(app, "<div class=\"notice result-note\">${m.accuracy >= 98", "<div class=\"notice result-note\">${prefs.drill === 'weak' ? 'The next lesson recalculates your key and fragment priorities. Mastered patterns remain eligible for review. ' : ''}${m.accuracy >= 98")
replace(app, "  const langs = [...new Set(history.map(r => r.language))];", "  const fragmentLanguage = filter === 'all' ? prefs.language : filter;\n  const fragments = skillProfile(history, { language: fragmentLanguage, goal: prefs.goal }).filter(item => Array.from(item.token).length > 1 && item.known).slice(0, 8);\n  const langs = [...new Set(history.map(r => r.language))];")
old = '  <section class="panel history-panel"><div class="section-kicker">RECENT SESSION SPEED</div>'
new = '''  <section class="panel history-panel"><div class="section-kicker">RECENT FRAGMENT SKILLS · ${esc(fragmentLanguage)}</div><h2>Mastered does not mean retired.</h2>${fragments.length ? `<div class="weak-grid">${fragments.map(item => `<div><kbd>${esc(showKey(item.token).split(String.fromCharCode(10)).join('↵'))}</kbd><strong>${fmt(100 * (1 - item.errorRate), 1)}%</strong><small>${fmt(item.meanLatency)} ms / transition</small><small>${esc(item.bucket)}</small></div>`).join('')}</div>` : '<p class="muted">Complete more sessions to measure character pairs and common syntax fragments.</p>'}<p class="muted">Recent sessions carry more weight. Refinement revisits accurate patterns too. Fragment timing excludes interrupted spans. Custom snippets do not add longer fragment records.</p></section>
  <section class="panel history-panel"><div class="section-kicker">RECENT SESSION SPEED</div>'''
replace(app, old, new)
# Allow the original archive packager to include the new transparent source module.
standalone = root / 'keyforge/make-standalone.py'
if standalone.exists():
    replace(standalone, "('engine.mjs', 'lessons.mjs', 'app.mjs')", "('engine.mjs', 'lessons.mjs', 'adaptive.mjs', 'app.mjs')")
# The existing CI invokes this test file; load the additional independent suite.
test = root / 'tests-keyforge/engine.test.mjs'
replace(test, "import { test } from 'node:test';", "import './adaptive.test.mjs';\nimport { test } from 'node:test';")
replace(app, 'Weak-key repair uses your recorded error rates, then average latency, with a minimum of five attempts per key.', 'Continuous refinement mixes repair, retention, and exploration, using recent key and fragment accuracy and latency. Mastered patterns remain eligible. Suggestions use at least three comparable sessions; accuracy below 98% lowers the suggested pace. Lessons change between runs, never under your cursor.')
replace(app, 'Saved key and pair aggregates can reveal character patterns', 'Saved key, pair, and allowlisted fragment aggregates can reveal character patterns')
replace(lab / 'policy.html', 'including character and pair statistics.', 'including character, pair, and allowlisted syntax-fragment statistics. Custom snippets do not contribute longer fragment records.')
# Update deployment examples only. This never changes hosted DNS or services.
for name in ('.env.keyforge.example', 'Caddyfile', 'README-KEYFORGE.md'):
    file = root / name
    if file.exists():
        file.write_text(file.read_text().replace('typing.jasonbreedlove.dev', 'jasonbreedlove.io'))
# Run additional live browser checks in the existing CI browser step.
browser = root / 'tests-keyforge/live-browser.py'
anchor = "print(json.dumps({'passed': len(checks), 'mode': 'live-origin'}, indent=2))"
replace(browser, anchor, anchor + "\nimport runpy\nrunpy.run_path('tests-keyforge/refinement-browser.py', run_name='__main__')")
print('Continuous refinement integrated. Existing v1 history remains readable. No domain was changed.')
