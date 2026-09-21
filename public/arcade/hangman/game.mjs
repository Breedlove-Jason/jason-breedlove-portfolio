export const levels = { easy: { attempts: 8, min: 1, max: 4 }, normal: { attempts: 6, min: 5, max: 6 }, hard: { attempts: 5, min: 7, max: 30 } };
export class Game {
  constructor(word, attempts) {
    if (!/^[a-z]+$/i.test(word) || !Number.isInteger(attempts) || attempts < 1) throw new Error('Invalid game');
    this.word = word.toLowerCase(); this.attempts = attempts; this.guesses = new Set();
  }
  get misses() { return [...this.guesses].filter(letter => !this.word.includes(letter)); }
  get remaining() { return this.attempts - this.misses.length; }
  get won() { return [...this.word].every(letter => this.guesses.has(letter)); }
  get finished() { return this.won || this.remaining === 0; }
  get progress() { return [...this.word].map(letter => this.guesses.has(letter) ? letter : '_'); }
  guess(input) {
    if (this.finished) return 'finished';
    if (typeof input !== 'string' || !/^[a-z]$/i.test(input.trim())) return 'invalid';
    const letter = input.trim().toLowerCase();
    if (this.guesses.has(letter)) return 'repeated';
    this.guesses.add(letter);
    return this.word.includes(letter) ? 'correct' : 'incorrect';
  }
}
export function pickWord(words, difficulty, random = Math.random) {
  const level = levels[difficulty];
  const pool = words.filter(word => word.length >= level.min && word.length <= level.max);
  return pool[Math.floor(random() * pool.length)];
}
