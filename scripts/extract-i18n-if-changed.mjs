import { execSync } from 'node:child_process';
import process from 'node:process';

// lint-staged passes staged file paths as arguments — check if any belong to memory-game
const stagedFiles = process.argv.slice(2);
const affectsMemoryGame = stagedFiles.some((f) => f.includes('apps/memory-game'));

if (!affectsMemoryGame) {
  process.exit(0);
}

console.log('HTML templates changed — extracting i18n strings...');

try {
  execSync('npm run memory-game:extract-i18n', { stdio: 'inherit' });
  // Stage the updated ARB file so it's included in the commit
  execSync('git add apps/memory-game/src/locale/messages.en.arb', { stdio: 'inherit' });
} catch {
  console.error('extract-i18n failed — commit aborted');
  process.exit(1);
}
