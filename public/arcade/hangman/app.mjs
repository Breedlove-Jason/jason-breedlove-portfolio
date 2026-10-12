import { Game, levels, pickWord } from './game.mjs';
import { words } from './words.mjs';
const $ = id => document.getElementById(id);
let game, counted = false, score = { wins: 0, losses: 0, streak: 0 };
try { const saved = JSON.parse(localStorage.getItem('hangman-score-v1')); if (saved && ['wins','losses','streak'].every(k => Number.isSafeInteger(saved[k]) && saved[k] >= 0) && saved.streak <= saved.wins) score = saved; } catch {}
for (const letter of 'abcdefghijklmnopqrstuvwxyz') { const button = document.createElement('button'); button.type = 'button'; button.className = 'key'; button.textContent = letter.toUpperCase(); button.dataset.letter = letter; button.setAttribute('aria-label', `Guess ${letter.toUpperCase()}`); button.addEventListener('click', () => guess(letter)); $('keyboard').append(button); }
function saveScore() { try { localStorage.setItem('hangman-score-v1', JSON.stringify(score)); } catch { $('storage-note').textContent = 'Storage unavailable. Scores last for this visit only.'; } }
function render(message) {
  $('word').replaceChildren(...game.progress.map((letter, index) => { const span = document.createElement('span'); span.className = 'letter'; span.textContent = letter === '_' ? '\u00a0' : letter; if (game.finished && !game.won && letter === '_') { span.textContent = game.word[index]; span.classList.add('revealed'); } return span; }));
  $('word').setAttribute('aria-label', game.finished ? `The animal was ${game.word}` : game.progress.join(' '));
  $('remaining').textContent = `${game.remaining} chance${game.remaining === 1 ? '' : 's'} left`;
  $('missed').textContent = game.misses.join(' ') || 'None yet';
  const stage = Math.floor(game.misses.length * 6 / game.attempts);
  document.querySelectorAll('[data-stage]').forEach(part => { part.hidden = Number(part.dataset.stage) > stage; part.style.display = part.hidden ? 'none' : ''; });
  $('drawing-title').textContent = `Hangman drawing: ${game.misses.length} misses out of ${game.attempts}`;
  document.querySelectorAll('[data-letter]').forEach(button => { const letter = button.dataset.letter, used = game.guesses.has(letter); button.disabled = used || game.finished; button.classList.toggle('correct', used && game.word.includes(letter)); button.classList.toggle('incorrect', used && !game.word.includes(letter)); });
  $('message').textContent = message;
  for (const key of ['wins','losses','streak']) $(key).textContent = score[key];
}
function guess(letter) {
  const result = game.guess(letter);
  if (['finished','repeated','invalid'].includes(result)) return;
  let message = result === 'correct' ? `${letter.toUpperCase()} is in the word. Nice instinct.` : `No ${letter.toUpperCase()} this time. Keep going.`;
  if (game.finished && !counted) { counted = true; if (game.won) { score.wins++; score.streak++; message = `You found it! ${game.word.toUpperCase()}. Ready for another?`; } else { score.losses++; score.streak = 0; message = `The animal was ${game.word.toUpperCase()}. A fresh round awaits.`; } saveScore(); }
  render(message);
  if (game.finished) $('new-round').focus();
}
function start() { const difficulty = $('difficulty').value; game = new Game(pickWord(words, difficulty), levels[difficulty].attempts); counted = false; $('round-level').textContent = difficulty.toUpperCase(); render(`${game.word.length} letters. Choose a letter to begin.`); }
$('new-round').addEventListener('click', start);
$('reset-score').addEventListener('click', () => { if (window.confirm('Reset your wins, losses, and streak?')) { score = { wins: 0, losses: 0, streak: 0 }; saveScore(); render('Scoreboard reset. Your current round is unchanged.'); } });
document.addEventListener('keydown', event => { if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return; if (/^[a-z]$/i.test(event.key)) { event.preventDefault(); guess(event.key); } });
start();
