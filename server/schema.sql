CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 2 AND 100),
  email TEXT NOT NULL CHECK(length(email) <= 254),
  subject TEXT NOT NULL CHECK(length(subject) BETWEEN 2 AND 160),
  message TEXT NOT NULL CHECK(length(message) BETWEEN 20 AND 4000),
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'read', 'archived'))
) STRICT;
CREATE INDEX IF NOT EXISTS contact_messages_created_at ON contact_messages(created_at);
