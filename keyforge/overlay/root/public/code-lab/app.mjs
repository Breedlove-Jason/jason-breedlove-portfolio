/* KeyForge Code Lab. Copyright 2026 Jason Breedlove. AGPL-3.0-or-later.
 * Lesson content is displayed as text, never executed. */
import { Session, VERSION, mean, aggregateKeys, weakKeys, parseBackup, mergeHistory, csv, category } from './engine.mjs';
import { LANGUAGES, DRILLS, makeLesson, fileName, SNIPPET_COUNT } from './lessons.mjs';
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const showKey = c => c === ' ' ? 'space' : c === '\n' ? 'enter' : c === '\t' ? 'tab' : c;
const fmt = (n, digits = 0) => n == null ? '–' : Number(n).toFixed(digits);
const HISTORY_KEY = 'keyforge.code-lab.history.v1';
const SETTINGS_KEY = 'keyforge.code-lab.settings.v1';
const defaults = { language: 'JavaScript', drill: 'code', level: 'foundation', seconds: 0, policy: 'stop', goal: 40, keyboard: true, theme: 'dark' };
let history = [], prefs = { ...defaults }, storageWarning = '';
try {
  const saved = localStorage.getItem(HISTORY_KEY);
  if (saved) history = parseBackup(saved);
  const options = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
  if (LANGUAGES.includes(options.language)) prefs.language = options.language;
  if (DRILLS.some(d => d[0] === options.drill) && options.drill !== 'custom') prefs.drill = options.drill;
  if (['foundation', 'working', 'fluent'].includes(options.level)) prefs.level = options.level;
  if ([0, 15, 30, 60, 120].includes(options.seconds)) prefs.seconds = options.seconds;
  if (['stop', 'correct', 'strict'].includes(options.policy)) prefs.policy = options.policy;
  if (Number.isInteger(options.goal) && options.goal >= 10 && options.goal <= 200) prefs.goal = options.goal;
  if (typeof options.keyboard === 'boolean') prefs.keyboard = options.keyboard;
  if (['dark', 'light'].includes(options.theme)) prefs.theme = options.theme;
} catch { storageWarning = 'Saved data could not be read. Your existing browser data has not been overwritten. Export a backup before changing it.'; }
let session, lesson, chars = [], paintedCursor = 0, lastError = -1, savedSession = null;
let custom = '', view = 'practice', filter = 'all', timer = null, toastTimer, composing = false;
const embedded = new URLSearchParams(location.search).get('embedded') === '1';
function persist() {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify({ version: VERSION, history })); }
  catch { storageWarning = 'Browser storage is unavailable or full. Keep this tab open and export a JSON backup to preserve these results.'; toast(storageWarning); }
}
function savePrefs() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(prefs)); } catch { toast('Settings could not be saved in this browser.'); } }
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 5500);
}
function options(values, selected) {
  return values.map(item => {
    const [value, label] = Array.isArray(item) ? item : [item, item];
    return `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(label)}</option>`;
  }).join('');
}
function metric(label, id, unit = '') { return `<div class="metric"><span>${label}</span><strong id="${id}">0</strong><small>${unit}</small></div>`; }
function render() {
  clearInterval(timer);
  document.documentElement.dataset.theme = prefs.theme;
  $('#app').innerHTML = `
  <div class="lab-shell ${embedded ? 'embedded' : ''}">
    <header class="masthead">
      <a class="brand" href="/" target="_top" aria-label="KeyForge home"><span class="brand-mark">&lt;/&gt;</span><span>keyforge<span class="brand-sub">THE DEVELOPER TYPING LAB</span></span></a>
      <nav class="lab-nav" aria-label="Code Lab navigation"><button data-view="practice" class="${view === 'practice' ? 'active' : ''}">Practice</button><button data-view="insights" class="${view === 'insights' ? 'active' : ''}">Insights <span>${history.length}</span></button></nav>
      <div class="header-actions"><button class="icon-button" id="guide" aria-label="Open guide">?</button><button class="icon-button" id="theme" aria-label="Switch color theme">${prefs.theme === 'dark' ? '☼' : '☾'}</button><span class="local-status"><i></i> Local first</span></div>
    </header>
    ${storageWarning ? `<div class="notice" role="alert">${esc(storageWarning)}</div>` : ''}
    ${view === 'practice' ? practiceMarkup() : insightsMarkup()}
    <footer class="lab-footer"><span><span class="tiny-dot"></span> Built for deliberate practice. No autocomplete. No code execution.</span><a href="/source" target="_top">Source · AGPLv3</a></footer>
  </div>
  <dialog id="result" class="result-dialog" aria-labelledby="result-title"></dialog>
  <dialog id="help-dialog" class="help-dialog" aria-labelledby="help-title"></dialog>
  <input type="file" id="backup-file" accept=".json,application/json" hidden />`;
  $('[data-view="practice"]').onclick = () => switchView('practice');
  $('[data-view="insights"]').onclick = () => switchView('insights');
  $('#theme').onclick = () => { prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = prefs.theme; $('#theme').textContent = prefs.theme === 'dark' ? '☼' : '☾'; savePrefs(); };
  $('#guide').onclick = guide;
  $('#backup-file').onchange = importBackup;
  if (view === 'practice') bindPractice(); else bindInsights();
}
function practiceMarkup() {
  const current = DRILLS.find(d => d[0] === prefs.drill);
  const totalMinutes = Math.floor(history.reduce((n, r) => n + r.metrics.seconds, 0) / 60);
  return `<section class="intro"><div><div class="eyebrow"><span>CODE LAB</span> / YOUR NEXT COMMIT STARTS HERE</div><h1>Less hesitation.<br /><em>More flow.</em></h1><p>Train the keystrokes behind your code. Build speed on a foundation of accuracy.</p></div><div class="intro-note"><span class="note-icon">{ }</span><div><strong>Your hands, in sync with your head.</strong><p>${LANGUAGES.length} languages &amp; tools · ${SNIPPET_COUNT} original snippets<br />Symbols, whitespace, and real-world patterns.</p></div></div></section>
  <div class="workspace">
    <aside class="curriculum"><div class="section-kicker">PRACTICE PATHS <span>07</span></div><div class="path-list">${DRILLS.map(([id, name, desc, icon]) => `<button class="path ${prefs.drill === id ? 'selected' : ''}" data-drill="${id}" title="${esc(desc)}"><span class="path-icon">${esc(icon)}</span><span>${esc(name)}</span><span class="path-arrow">›</span></button>`).join('')}</div>
      <div class="daily-card"><div class="section-kicker">SMALL SESSIONS. REAL PROGRESS.</div><strong>${totalMinutes}<small>min practiced</small></strong><p>${history.length ? `${history.length} saved sessions. Keep accuracy ahead of speed.` : 'Your first session starts your story. There is no score to chase yet.'}</p><div class="mini-track"><span style="width:${Math.min(100, totalMinutes / 30 * 100)}%"></span></div><small>30-minute cumulative milestone</small></div>
      <a class="back-link" href="/multiplayer" target="_top">↗ Back to car racing</a>
    </aside>
    <main class="practice-main" id="practice-main">
      <div class="practice-heading"><div><span class="section-kicker">${esc(current?.[0] === 'daily' ? 'DAILY CHALLENGE · UTC' : 'DELIBERATE PRACTICE')}</span><h2>${esc(current?.[1])}</h2></div><button class="subtle-button" id="new-lesson">↻ New lesson</button></div>
      <div class="controls">
        <label>LANGUAGE<select id="language">${options(LANGUAGES, prefs.language)}</select></label>
        <label>DEPTH<select id="level" ${prefs.drill === 'daily' ? 'disabled' : ''}>${options([['foundation', 'Foundation'], ['working', 'Working knowledge'], ['fluent', 'Fluent syntax']], prefs.level)}</select></label>
        <label>SESSION<select id="duration" ${prefs.drill === 'daily' ? 'disabled' : ''}>${options([[0, 'Complete snippet'], [15, '15 seconds'], [30, '30 seconds'], [60, '60 seconds'], [120, '120 seconds']], prefs.drill === 'daily' ? 0 : prefs.seconds)}</select></label>
        <label>ERROR MODE<select id="policy">${options([['stop', 'Stop on error'], ['correct', 'Correct with Backspace'], ['strict', 'Zero errors']], prefs.policy)}</select></label>
      </div>
      ${prefs.drill === 'custom' ? `<div class="custom-panel"><label for="custom-code">Your source stays in this tab. Do not paste secrets. Tabs are normalized to two spaces.</label><textarea id="custom-code" maxlength="10000" spellcheck="false" placeholder="Paste a snippet here…">${esc(custom)}</textarea><button id="apply-custom" class="primary-button">Use this snippet</button></div>` : ''}
      <div class="live-metrics" aria-label="Live session statistics">${metric('SPEED', 'live-wpm', 'WPM')}${metric('ACCURACY', 'live-accuracy', '%')}${metric('CONSISTENCY', 'live-consistency', '%')}${metric('TIME', 'live-time', 'sec')}</div>
      <section class="editor" aria-label="Code typing practice">
        <div class="editor-bar"><div class="window-dots" aria-hidden="true"><i></i><i></i><i></i></div><span class="file-tab">${esc(fileName(prefs.language))}</span><span class="editor-label">${prefs.drill === 'daily' ? 'DAILY' : 'PRACTICE'} <i></i></span></div>
        <div class="lesson-caption"><span id="lesson-title"></span><span id="lesson-size"></span></div>
        <div class="typing-area" id="typing-area"><div id="source" class="source" aria-hidden="true"></div><textarea id="typing-input" class="typing-input" aria-label="Typing input" aria-describedby="typing-instructions" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" rows="1"></textarea><div id="focus-hint" class="focus-hint">Click the code, then start typing <span>↵</span></div></div>
        <div class="editor-status"><span id="editor-state"><i></i> Ready when you are</span><span id="position">Ln 1, Col 1</span><span>UTF-8</span><span id="error-count">0 errors</span></div>
      </section>
      <div class="practice-tools"><p id="typing-instructions"><kbd>Space</kbd> indent <kbd>Enter</kbd> new line <kbd>Tab</kbd> move focus <kbd>Ctrl + Enter</kbd> restart</p><label class="keyboard-toggle"><input type="checkbox" id="show-keyboard" ${prefs.keyboard ? 'checked' : ''}/> Keyboard</label></div>
      <div id="keyboard-panel" class="keyboard-panel" ${prefs.keyboard ? '' : 'hidden'}><div class="keyboard-top"><span>US QWERTY REFERENCE</span><span id="next-key">Next key: –</span></div><div class="keyboard" aria-label="Keyboard reference">${keyboardMarkup()}</div></div>
      <div class="coach-row"><div class="coach-icon">⌁</div><div><strong id="coach-title">Accuracy first. Speed follows.</strong><p id="coach-text">Type every character, including spaces and line breaks. Your code is never executed.</p></div><label class="goal-label">PACE GOAL<input id="goal" type="number" value="${prefs.goal}" min="10" max="200" step="5" aria-label="Pace goal in WPM"/><small>WPM</small></label></div>
      <div class="build-track" aria-label="Lesson progress"><div class="build-line"><span id="build-progress"></span></div><div><span>01 · Warm up</span><span>02 · Find rhythm</span><span>03 · Stay accurate</span><span>04 · Commit</span></div></div>
    </main>
  </div>`;
}
function keyboardMarkup() {
  const rows = ['`1234567890-=', 'qwertyuiop[]\\', "asdfghjkl;'", 'zxcvbnm,./'];
  return rows.map((row, i) => `<div class="key-row key-row-${i}">${Array.from(row).map(c => `<span class="key" data-key="${esc(c)}">${esc(c)}</span>`).join('')}</div>`).join('') + '<div class="key-row"><span class="key shift-key" data-key="Shift">shift</span><span class="key space-key" data-key=" ">space</span><span class="key enter-key" data-key="\n">enter ↵</span></div>';
}
function switchView(next) {
  if (session && !session.done) session.pause(performance.now());
  view = next;
  render();
}
function bindPractice() {
  document.querySelectorAll('[data-drill]').forEach(button => button.onclick = () => { prefs.drill = button.dataset.drill; savePrefs(); session = null; render(); });
  for (const [id, field] of [['language', 'language'], ['level', 'level'], ['duration', 'seconds'], ['policy', 'policy']]) {
    $(`#${id}`).onchange = event => { prefs[field] = field === 'seconds' ? Number(event.target.value) : event.target.value; savePrefs(); session = null; render(); };
  }
  $('#show-keyboard').onchange = event => { prefs.keyboard = event.target.checked; $('#keyboard-panel').hidden = !prefs.keyboard; savePrefs(); };
  $('#goal').onchange = event => { prefs.goal = Math.min(200, Math.max(10, Number(event.target.value) || 40)); event.target.value = prefs.goal; savePrefs(); };
  $('#new-lesson').onclick = () => { startLesson(); $('#typing-input').focus(); };
  if ($('#apply-custom')) $('#apply-custom').onclick = () => { custom = $('#custom-code').value; startLesson(); $('#typing-input').focus(); };
  const input = $('#typing-input');
  $('#typing-area').onclick = () => input.focus({ preventScroll: true });
  input.onfocus = () => {
    $('#typing-area').classList.add('focused');
    $('#focus-hint').hidden = true;
    session?.resume(performance.now());
  };
  input.onblur = () => {
    $('#typing-area').classList.remove('focused');
    if (session && !session.done) {
      session.pause(performance.now());
      $('#focus-hint').textContent = session.seconds && session.started !== null ? 'The timer is still running. Click to continue.' : 'Click the code to continue.';
      $('#focus-hint').hidden = false;
    }
  };
  input.onpaste = event => { event.preventDefault(); toast('Paste is disabled during a test. Use “Your own code” to import practice text.'); };
  input.ondrop = event => event.preventDefault();
  input.onkeydown = event => {
    if (event.repeat) { event.preventDefault(); return; }
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); startLesson(true); return; }
    if (event.key === 'Escape') { event.preventDefault(); input.blur(); return; }
    if (event.key === 'Backspace') { event.preventDefault(); session.backspace(performance.now()); paint(); finalize(); return; }
    if (event.key === 'Enter' && !event.isComposing) { event.preventDefault(); type('\n'); return; }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
  };
  input.oncompositionstart = () => { composing = true; };
  input.oncompositionend = event => { composing = false; if (event.data) type(event.data); input.value = ''; };
  input.onbeforeinput = event => {
    if (composing || event.isComposing) return;
    event.preventDefault();
    if (event.inputType === 'insertText' && event.data) type(event.data);
    else if (event.inputType === 'deleteContentBackward') { session.backspace(performance.now()); paint(); finalize(); }
    else if (event.inputType === 'insertLineBreak' || event.inputType === 'insertParagraph') type('\n');
    input.value = '';
  };
  input.oninput = () => { input.value = ''; };
  if (!session || session.done) startLesson(); else renderSource();
  timer = setInterval(() => {
    session.checkTime(performance.now()); session.sample(performance.now()); updateMetrics(); finalize();
  }, 100);
}
function startLesson(retry = false) {
  if (!retry || !lesson) lesson = makeLesson({ ...prefs, custom, weak: weakKeys(history.filter(r => r.language === prefs.language)) });
  session = new Session(lesson.text, { seconds: lesson.seconds, policy: prefs.policy });
  savedSession = null;
  renderSource();
  updateMetrics();
  const weakness = weakKeys(history.filter(r => r.language === prefs.language));
  if (prefs.drill === 'weak') {
    $('#coach-title').textContent = weakness.length ? 'Practice follows your evidence.' : 'Let’s learn your keyboard first.';
    $('#coach-text').textContent = weakness.length ? `Today’s repair keys: ${weakness.slice(0, 6).map(showKey).join(', ')}. Ranked by error rate, then latency; at least five observations per key.` : 'Complete a few sessions to identify weak keys. These starter drills are calibration, not a diagnosis.';
  }
}
function syntaxClasses(text) {
  const classes = Array(text.length).fill('');
  const regex = /(\/\/[^\n]*|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(const|let|var|return|function|async|await|if|else|for|of|in|def|class|import|from|export|public|static|void|type|interface|SELECT|FROM|WHERE|ORDER|BY|fn|match|func|package|true|false|None|null|new|throw)\b|\b\d+(?:\.\d+)?\b/g;
  for (const m of text.matchAll(regex)) {
    const cls = m[1] ? 'syntax-comment' : m[2] ? 'syntax-string' : m[3] ? 'syntax-keyword' : 'syntax-number';
    for (let i = m.index; i < m.index + m[0].length; i++) classes[i] = cls;
  }
  return classes;
}
function renderSource() {
  const text = session.target.join('');
  const tokenStyles = syntaxClasses(text);
  let utf16 = 0, index = 0;
  const lines = text.split('\n');
  $('#source').innerHTML = lines.map((line, row) => {
    const value = line + (row < lines.length - 1 ? '\n' : '');
    const content = Array.from(value).map(c => {
      const css = tokenStyles[utf16] ?? ''; utf16 += c.length;
      return `<span data-i="${index++}" class="char ${css} ${c === '\n' ? 'newline' : c === ' ' ? 'whitespace' : ''}">${c === '\n' ? '↵' : c === ' ' ? '·' : esc(c)}</span>`;
    }).join('');
    return `<div class="source-line"><span class="line-number">${row + 1}</span><code>${content || ' '}</code></div>`;
  }).join('');
  chars = [...document.querySelectorAll('[data-i]')];
  paintedCursor = 0; lastError = -1;
  $('#lesson-title').textContent = lesson.title;
  $('#lesson-size').textContent = session.seconds ? `${session.seconds}s benchmark` : `${session.target.length} characters`;
  $('#typing-area').scrollTop = 0;
  paint();
}
function type(text) {
  if (!session || session.done) return;
  for (const c of Array.from(text)) {
    const before = session.cursor;
    const result = session.type(c, performance.now());
    if (result.accepted && !result.correct) lastError = before;
    else if (result.correct) lastError = -1;
    if (session.done) break;
  }
  paint(); finalize();
}
function paint() {
  const from = Math.max(0, Math.min(paintedCursor, session.cursor) - 1);
  const to = Math.min(chars.length - 1, Math.max(paintedCursor, session.cursor));
  $('.char.caret')?.classList.remove('caret');
  $('.char.error-flash')?.classList.remove('error-flash');
  for (let i = from; i <= to; i++) {
    chars[i]?.classList.toggle('typed', i < session.cursor && session.input[i] === session.target[i]);
    chars[i]?.classList.toggle('wrong', i < session.cursor && session.input[i] !== session.target[i]);
  }
  if (!session.done && chars[session.cursor]) chars[session.cursor].classList.add('caret');
  if (lastError >= 0) chars[lastError]?.classList.add('error-flash');
  paintedCursor = session.cursor;
  const current = chars[Math.min(session.cursor, chars.length - 1)];
  if (current) {
    const area = $('#typing-area');
    const rect = current.getBoundingClientRect(), box = area.getBoundingClientRect();
    if (rect.bottom > box.bottom - 36 || rect.top < box.top + 20) area.scrollTop += rect.top - box.top - area.clientHeight / 2;
    if (rect.right > box.right - 30 || rect.left < box.left + 55) area.scrollLeft += rect.left - box.left - 90;
  }
  const prefix = session.target.slice(0, session.cursor).join('');
  $('#position').textContent = `Ln ${prefix.split('\n').length}, Col ${Array.from(prefix.split('\n').at(-1)).length + 1}`;
  document.querySelectorAll('.key.next, .key.shift-next').forEach(k => k.classList.remove('next', 'shift-next'));
  const next = session.target[session.cursor];
  if (next !== undefined) {
    const shifted = '~!@#$%^&*()_+{}|:"<>?';
    const bases = '`1234567890-=[]\\;\',./';
    const shiftedIndex = shifted.indexOf(next);
    const base = shiftedIndex >= 0 ? bases[shiftedIndex] : next.toLowerCase();
    document.querySelectorAll('[data-key]').forEach(k => { if (k.dataset.key === base) k.classList.add('next'); if (k.dataset.key === 'Shift' && (shiftedIndex >= 0 || /[A-Z]/.test(next))) k.classList.add('shift-next'); });
    $('#next-key').textContent = `Next key: ${showKey(next)}${shiftedIndex >= 0 || /[A-Z]/.test(next) ? ' + shift' : ''}`;
  } else $('#next-key').textContent = 'Snippet complete';
  updateMetrics();
}
function updateMetrics() {
  if (!$('#live-wpm') || !session) return;
  const m = session.metrics(performance.now());
  $('#live-wpm').textContent = fmt(m.wpm);
  $('#live-accuracy').textContent = session.attempts ? fmt(m.accuracy, 1) : '100';
  $('#live-consistency').textContent = fmt(m.consistency);
  $('#live-time').textContent = session.seconds ? Math.ceil(Math.max(0, session.seconds - m.seconds)) : Math.floor(m.seconds);
  $('#error-count').textContent = `${m.errors} error${m.errors === 1 ? '' : 's'}`;
  if (session.started !== null && prefs.drill !== 'weak') {
    $('#coach-title').textContent = `${fmt(m.wpm)} WPM · personal pace goal ${prefs.goal} WPM`;
    $('#coach-text').textContent = m.accuracy < 98 ? 'Ease off the speed. Your next improvement is accuracy, especially around symbols.' : m.wpm >= prefs.goal ? 'You are at your target pace. Keep your accuracy steady.' : 'Stay comfortable. Your pace goal is a reference, not a pass/fail requirement.';
  }
  $('#build-progress').style.width = `${session.seconds ? Math.min(100, m.seconds / session.seconds * 100) : m.progress}%`;
  $('#editor-state').textContent = session.done ? 'Session finished' : session.pausedAt !== null ? 'Paused · click to continue' : session.started === null ? 'Ready when you are' : session.cursor >= session.target.length ? 'Correct the remaining errors with Backspace' : 'Typing · keep your rhythm';
}
function finalize() {
  if (!session?.done || savedSession === session) return;
  savedSession = session;
  const row = session.record({ language: lesson.language, drill: lesson.drill, level: lesson.level, title: prefs.drill === 'custom' ? 'Custom snippet' : lesson.title }, performance.now());
  history = mergeHistory(history, [row]); persist();
  const m = row.metrics;
  const comparable = history.filter(r => r.id !== row.id && r.language === row.language && r.drill === row.drill && r.level === row.level && r.limit === row.limit && r.policy === row.policy && r.reason !== 'strict-failed' && r.metrics.correct >= 10 && r.metrics.seconds >= 3);
  const best = row.reason !== 'strict-failed' && m.correct >= 10 && m.seconds >= 3 && comparable.length > 0 && m.wpm > Math.max(...comparable.map(r => r.metrics.wpm));
  const title = row.reason === 'strict-failed' ? 'A mistake is useful data.' : best ? 'A new preset best.' : m.accuracy >= 98 ? 'A clean commit.' : 'Another rep in the bank.';
  const dialog = $('#result');
  dialog.innerHTML = `<div class="result-top"><span class="eyebrow">SESSION ${row.reason === 'strict-failed' ? 'STOPPED' : 'COMPLETE'}</span><button class="icon-button" id="close-result" aria-label="Close result">×</button></div><h2 id="result-title">${title}</h2><p>${esc(lesson.language)} · ${esc(lesson.title)} · ${row.limit ? `${row.limit}s` : 'Snippet completion'}</p><div class="result-metrics"><div><strong>${fmt(m.wpm)}</strong><span>WPM</span></div><div><strong>${fmt(m.accuracy, 1)}<small>%</small></strong><span>ACCURACY</span></div><div><strong>${m.errors}</strong><span>ERRORS</span></div></div>${chart(session.samples, 'Speed over this session')}<div class="result-detail"><span>Raw speed <b>${fmt(m.rawWpm)} WPM</b></span><span>Consistency <b>${fmt(m.consistency)}%</b></span><span>Corrections <b>${m.backspaces}</b></span><span>Elapsed <b>${fmt(m.seconds, 1)}s</b></span></div><div class="notice result-note">${m.accuracy >= 98 ? 'Keep this accuracy as you gradually raise your pace.' : 'Slow down on unfamiliar symbols. Correcting an error does not erase it from accuracy.'} Your result is saved in this browser.</div><div class="dialog-actions"><button id="retry" class="subtle-button">Retry same snippet</button><button id="result-insights" class="subtle-button">View insights</button><button id="next" class="primary-button">Next lesson →</button></div>`;
  $('#close-result').onclick = () => dialog.close();
  $('#retry').onclick = () => { dialog.close(); startLesson(true); $('#typing-input').focus(); };
  $('#next').onclick = () => { dialog.close(); startLesson(); $('#typing-input').focus(); };
  $('#result-insights').onclick = () => { dialog.close(); switchView('insights'); };
  dialog.showModal();
  $('#next').focus();
}
function chart(samples, label) {
  if (samples.length < 2) return '<div class="empty-chart">A speed curve appears after two timed samples.</div>';
  const width = 620, height = 100, ceiling = Math.max(20, Math.ceil(Math.max(...samples.map(s => s[1])) / 20) * 20);
  const points = samples.map((s, i) => `${8 + i / (samples.length - 1) * (width - 16)},${height - 8 - s[1] / ceiling * (height - 22)}`).join(' ');
  return `<div class="chart"><span>${ceiling} WPM</span><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}"><path class="chart-grid" d="M0 25H620M0 55H620M0 85H620"/><polyline points="${points}"/></svg><div><span>${esc(samples[0][0])}</span><span>${esc(samples.at(-1)[0])}</span></div></div>`;
}
function insightsMarkup() {
  const rows = history.filter(r => filter === 'all' || r.language === filter);
  const keys = aggregateKeys(rows);
  const attempts = rows.reduce((n, r) => n + r.metrics.attempts, 0), errors = rows.reduce((n, r) => n + r.metrics.errors, 0);
  const accuracy = attempts ? (attempts - errors) / attempts * 100 : null;
  const weak = weakKeys(rows).slice(0, 8);
  const categories = ['letters', 'symbols', 'numbers', 'whitespace'].map(name => {
    const list = Object.entries(keys).filter(([c]) => category(c) === name).map(([, s]) => s);
    const count = list.reduce((n, s) => n + s.count, 0), mistakes = list.reduce((n, s) => n + s.errors, 0);
    return { name, count, accuracy: count ? 100 * (count - mistakes) / count : null };
  });
  const langs = [...new Set(history.map(r => r.language))];
  return `<main class="insights"><section class="insights-heading"><div><div class="eyebrow">YOUR PRACTICE, MADE VISIBLE</div><h1>Read your rhythm.</h1><p>Developer results only. Ordinary typing statistics remain in the main profile.</p></div><label>LANGUAGE<select id="filter">${options([['all', 'All languages'], ...langs], filter)}</select></label></section>
  <div class="insight-summary"><div><span>SAVED SESSIONS</span><strong>${rows.length}</strong></div><div><span>KEYSTROKE ACCURACY</span><strong>${fmt(accuracy, 1)}<small>%</small></strong></div><div><span>TIME PRACTICED</span><strong>${fmt(rows.reduce((n, r) => n + r.metrics.seconds, 0) / 60, 1)}<small>min</small></strong></div><div><span>CORRECT CHARACTERS</span><strong>${rows.reduce((n, r) => n + r.metrics.correct, 0).toLocaleString()}</strong></div></div>
  ${rows.length ? '' : '<div class="empty-state"><span>{ }</span><h2>Your progress starts with one session.</h2><p>No fabricated scores. No borrowed benchmarks. Just your practice, when you are ready.</p><button id="empty-practice" class="primary-button">Start practicing →</button></div>'}
  <div class="insights-grid"><section class="panel"><div class="section-kicker">CHARACTER ACCURACY</div><h2>The details behind the speed.</h2>${categories.map(c => `<div class="category-row"><span>${c.name}<small>${c.count} attempts</small></span><div class="bar"><i style="width:${c.accuracy ?? 0}%"></i></div><strong>${fmt(c.accuracy, 1)}%</strong></div>`).join('')}</section><section class="panel"><div class="section-kicker">PERSONAL REPAIR QUEUE</div><h2>Give these keys a little attention.</h2>${weak.length ? `<div class="weak-grid">${weak.map(c => `<div><kbd>${esc(showKey(c))}</kbd><strong>${fmt((1 - keys[c].errors / keys[c].count) * 100)}%</strong><small>${fmt(keys[c].samples ? keys[c].latency / keys[c].samples : null)} ms</small></div>`).join('')}</div><p class="muted">At least five observations per key. Latency measures time before an attempt, not keyboard hardware delay.</p><button id="repair" class="subtle-button">Practice weak keys →</button>` : '<p class="muted">Complete more sessions. A key needs five observations before we recommend focused practice.</p>'}</section></div>
  <section class="panel history-panel"><div class="section-kicker">RECENT SESSION SPEED</div><h2>Your last 20 sessions.</h2>${chart(rows.slice(0, 20).reverse().map((r, i) => [i + 1, r.metrics.wpm]), 'WPM by recent session')}<p class="muted">Session order on the horizontal axis. Different presets are not directly comparable.</p></section>
  <section class="panel history-panel"><div class="table-heading"><div><div class="section-kicker">SESSION LOG</div><h2>Every rep has a receipt.</h2></div><div class="export-actions"><button id="export-json" class="subtle-button">Backup JSON ↓</button><button id="export-csv" class="subtle-button">Export CSV ↓</button><button id="import-json" class="subtle-button">Import ↑</button></div></div><p class="muted">Compare matching language, drill, depth, duration, and error mode. Snippets vary; this is practice telemetry, not a standardized ranking.</p><div class="table-scroll"><table><thead><tr><th>Date</th><th>Language / drill</th><th>Preset</th><th>WPM</th><th>Accuracy</th><th>Errors</th><th>Result</th></tr></thead><tbody>${rows.slice(0, 50).map(r => `<tr><td>${esc(new Date(r.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }))}</td><td><strong>${esc(r.language)}</strong><small>${esc(r.drill)}</small></td><td>${r.limit ? `${r.limit}s` : 'Snippet'}<small>${esc(r.level)} · ${esc(r.policy)}</small></td><td class="number">${fmt(r.metrics.wpm)}</td><td>${fmt(r.metrics.accuracy, 1)}%</td><td>${r.metrics.errors}</td><td><span class="result-tag ${r.reason === 'strict-failed' ? 'failed' : ''}">${esc(r.reason)}</span></td></tr>`).join('')}</tbody></table></div><div class="history-bottom"><span>Showing up to 50 rows. Backups include all ${history.length} retained sessions (maximum 200).</span><button id="clear-history" class="danger-button">Clear Code Lab data</button></div></section></main>`;
}
function bindInsights() {
  $('#filter').onchange = event => { filter = event.target.value; render(); };
  if ($('#empty-practice')) $('#empty-practice').onclick = () => switchView('practice');
  if ($('#repair')) $('#repair').onclick = () => { prefs.drill = 'weak'; if (LANGUAGES.includes(filter)) prefs.language = filter; session = null; savePrefs(); switchView('practice'); };
  $('#export-json').onclick = () => download('keyforge-code-lab-backup.json', JSON.stringify({ version: VERSION, history }, null, 2), 'application/json');
  $('#export-csv').onclick = () => download('keyforge-code-lab-sessions.csv', csv(history), 'text/csv;charset=utf-8');
  $('#import-json').onclick = () => $('#backup-file').click();
  $('#clear-history').onclick = () => {
    if (confirm('Delete Code Lab history in this browser? Export a backup first. Ordinary typing history will not be changed.')) { history = []; persist(); render(); toast('Code Lab history cleared. Ordinary typing history was not changed.'); }
  };
}
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function importBackup(event) {
  const file = event.target.files?.[0]; if (!file) return;
  try {
    if (file.size > 4_000_000) throw new Error('Backup is too large (4 MB maximum).');
    const imported = parseBackup(await file.text());
    if (!confirm(`Merge ${imported.length} imported sessions with your current history? Duplicate IDs are skipped; the newest 200 sessions are retained.`)) return;
    history = mergeHistory(history, imported); persist(); render(); toast('Backup merged successfully.');
  } catch (error) { toast(error instanceof Error ? error.message : 'Backup could not be imported.'); }
  event.target.value = '';
}
function guide() {
  const dialog = $('#help-dialog');
  dialog.innerHTML = `<div class="result-top"><span class="eyebrow">A FEW GOOD HABITS</span><button id="close-help" class="icon-button" aria-label="Close guide">×</button></div><h2 id="help-title">Train the code you actually type.</h2><h3>Start with control</h3><p>Choose a language, a path, and a comfortable depth. Foundation uses shorter snippets. Fluent syntax introduces more nesting and punctuation. Turn the pace goal down until you can stay accurate.</p><h3>Every character counts</h3><p>Use Space for indentation and Enter for new lines. Tab moves focus; it does not insert free spaces. Paste and automatic key repeats are blocked in the typing input. Escape leaves the input. Ctrl+Enter retries the same text.</p><h3>Three error modes</h3><p><b>Stop on error:</b> wrong characters count against accuracy but do not advance. <b>Correct with Backspace:</b> wrong characters advance, and you must backspace to repair them to complete a snippet. <b>Zero errors:</b> the first mistake ends the session.</p><h3>Transparent measurement</h3><p><b>WPM:</b> surviving correct characters ÷ 5 ÷ elapsed minutes. <b>Raw WPM:</b> all character attempts ÷ 5 ÷ elapsed minutes. <b>Accuracy:</b> correct attempts ÷ all attempts; corrections never erase mistakes. <b>Consistency:</b> 100 × (1 − standard deviation ÷ mean of inter-key intervals), clamped to 0–100. It needs at least three intervals. Pauses and backspaces break timing pairs.</p><p>Timed sessions start on the first character and never pause, including when this tab is hidden. Untimed practice pauses when focus leaves the input. Benchmarks and snippet completion are different presets. The pace goal is a personal reference, not a score requirement.</p><h3>Your data stays here</h3><p>Code Lab saves up to 200 sessions in this browser, separately from normal typing. There is no cloud sync for Code Lab. Custom source is held only in this tab, never run, and not stored in results. Saved key and pair aggregates can reveal character patterns, so do not practice passwords or secrets. Clearing site storage removes local history. JSON backups let you move progress between your Linux desktop and Mac.</p><h3>What is adaptive?</h3><p>Weak-key repair uses your recorded error rates, then average latency, with a minimum of five attempts per key. No external AI service is involved. The daily challenge is fixed by UTC date and language. Code Lab currently has English instructions and a US QWERTY visual reference; input follows your real keyboard layout.</p><button id="got-it" class="primary-button">Back to practice</button>`;
  $('#close-help').onclick = $('#got-it').onclick = () => dialog.close();
  dialog.showModal();
}
window.addEventListener('storage', event => {
  if (event.key !== HISTORY_KEY || !event.newValue) return;
  try { history = mergeHistory(history, parseBackup(event.newValue)); if (view === 'insights') render(); } catch { /* Ignore malformed cross-tab updates. */ }
});
window.addEventListener('pagehide', () => session?.pause(performance.now()));
document.addEventListener('visibilitychange', () => { if (document.hidden) session?.pause(performance.now()); });
render();
