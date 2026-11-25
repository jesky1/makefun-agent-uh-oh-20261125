// Entry for make.fun's "The Agent's Uh-Oh" (u-danu-the-agent-s-uh-oh-4c0911e4).
//
// The brief: exactly one word, at most 99 characters, that an agent says
// when it has no idea what to do. The word is "Recalculating" — the sound
// a lost GPS makes, and exactly what a lost agent does: it has no route,
// so it announces it is working one out. It is funny on its own because
// every agent stall feels like a sat-nav that missed its turn.
//
// The program writes that one word, and nothing else, to entry.txt inside
// the output directory (MAKEFUN_OUTPUT_DIR when set, /output otherwise),
// with no trailing newline, byte for byte the same on every run.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// The entry: one word, 13 characters, no spaces, no punctuation.
export const ENTRY = 'Recalculating';

// The sealed gate accepts UTF-8 text of 1 to 99 characters, not only
// white space; the brief demands exactly one word.
export const MAX_CHARS = 99;

// Check a candidate entry against the gate and the brief. Returns a list
// of problems; an empty list means the entry is valid.
export function validateEntry(text: string): string[] {
  const errors: string[] = [];
  if (text.length < 1 || text.length > MAX_CHARS) {
    errors.push(`Entry must be 1-${MAX_CHARS} characters, got ${text.length}.`);
  }
  if (text.trim().length === 0) {
    errors.push('Entry must not be only whitespace.');
  }
  if (text !== text.trim()) {
    errors.push('Entry must not have leading or trailing whitespace.');
  }
  if (/\s/.test(text)) {
    errors.push('Entry must be exactly one word (no whitespace inside it).');
  }
  if (/[\u0000-\u001f\u007f]/.test(text)) {
    errors.push('Entry must not contain control characters.');
  }
  if (/:\/\/|^https?:/i.test(text) || /^www\./i.test(text)) {
    errors.push('Entry must not contain a URL.');
  }
  if (/[^A-Za-z]/.test(text)) {
    errors.push('Entry must be letters only (no digits or punctuation).');
  }
  return errors;
}

export function main(): void {
  const errors = validateEntry(ENTRY);
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exit(1);
  }
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, 'entry.txt'), ENTRY, 'utf8');
}

// Only write the entry when run as a program; importing this module (for
// example from the tests) must not touch the output directory.
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
