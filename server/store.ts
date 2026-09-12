import { DatabaseSync } from 'node:sqlite';
import { chmodSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { ContactFields } from '../shared/contact.js';

export interface ContactStore {
  save(data: ContactFields): string;
  close(): void;
}

export function createStore(filename = './data/contact.sqlite'): ContactStore {
  const path = filename === ':memory:' ? filename : resolve(filename);
  if (path !== ':memory:')
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path);
  if (path !== ':memory:') chmodSync(path, 0o600);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  db.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  const insert = db.prepare(
    'INSERT INTO contact_messages (id, name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  );
  return {
    save(data) {
      const id = randomUUID();
      insert.run(
        id,
        data.name,
        data.email,
        data.subject,
        data.message,
        new Date().toISOString(),
      );
      return id;
    },
    close() {
      db.close();
    },
  };
}
