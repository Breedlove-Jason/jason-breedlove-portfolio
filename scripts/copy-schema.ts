import { copyFileSync, mkdirSync } from 'node:fs';
mkdirSync('dist-server/server', { recursive: true });
copyFileSync('server/schema.sql', 'dist-server/server/schema.sql');
