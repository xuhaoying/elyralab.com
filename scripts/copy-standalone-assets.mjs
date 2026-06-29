import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const standaloneDir = join(root, '.next', 'standalone');
const nextStaticDir = join(root, '.next', 'static');
const standaloneNextDir = join(standaloneDir, '.next');
const standaloneStaticDir = join(standaloneNextDir, 'static');
const publicDir = join(root, 'public');
const standalonePublicDir = join(standaloneDir, 'public');

function copyDirectory(source, destination) {
  if (!existsSync(source)) {
    return false;
  }

  rmSync(destination, { force: true, recursive: true });
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true });
  return true;
}

if (!existsSync(standaloneDir)) {
  console.log('No standalone output found; skipping standalone asset copy.');
  process.exit(0);
}

mkdirSync(standaloneNextDir, { recursive: true });

const copiedStatic = copyDirectory(nextStaticDir, standaloneStaticDir);
const copiedPublic = copyDirectory(publicDir, standalonePublicDir);

console.log(
  `Standalone assets copied: static=${copiedStatic ? 'yes' : 'no'}, public=${
    copiedPublic ? 'yes' : 'no'
  }`
);
