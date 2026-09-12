import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';

// Local operator access only. No contact details are exposed through the website.
const db = new DatabaseSync(
  resolve(process.env.CONTACT_DB_PATH || './data/contact.sqlite'),
  { readOnly: true },
);
const messages = db
  .prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100')
  .all();
console.log(JSON.stringify(messages, null, 2));
db.close();
