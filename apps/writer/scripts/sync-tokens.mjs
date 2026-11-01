// Copies the design tokens (single source of truth: replica/jenni/design) into the app.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const from = resolve(here, '../../../replica/jenni/design/tokens.css');
const to = resolve(here, '../src/styles/tokens.css');
mkdirSync(dirname(to), { recursive: true });
copyFileSync(from, to);
console.log('tokens.css synced');
