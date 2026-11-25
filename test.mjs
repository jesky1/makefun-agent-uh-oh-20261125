// Tests for the "The Agent's Uh-Oh" entry (main.ts).
//
// Run with: node --test test.mjs
// Covers: the validator accepts the real entry, rejects over-limit,
// whitespace-only, multi-word, leading/trailing-space and control-char
// inputs, and the program writes byte-identical entry.txt on repeat runs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ENTRY, MAX_CHARS, validateEntry } from './main.ts';

test('the real entry is one word inside the gate', () => {
  assert.equal(ENTRY, 'Recalculating');
  assert.equal(ENTRY.length, 13);
  assert.ok(ENTRY.length >= 1 && ENTRY.length <= MAX_CHARS);
  assert.deepEqual(validateEntry(ENTRY), []);
});

test('validator rejects an over-limit word', () => {
  const tooLong = 'R'.repeat(MAX_CHARS + 1);
  assert.ok(validateEntry(tooLong).length > 0);
});

test('validator rejects whitespace-only input', () => {
  assert.ok(validateEntry('   ').length > 0);
  assert.ok(validateEntry('').length > 0);
});

test('validator rejects more than one word', () => {
  assert.ok(validateEntry('Recalculating again').length > 0);
});

test('validator rejects leading or trailing space', () => {
  assert.ok(validateEntry(' Recalculating').length > 0);
  assert.ok(validateEntry('Recalculating ').length > 0);
});

test('validator rejects control characters', () => {
  assert.ok(validateEntry('Recalcula\ting').length > 0);
  assert.ok(validateEntry('Recalculating\u0007').length > 0);
});

test('two runs write byte-identical entry.txt with no trailing newline', () => {
  const dirA = mkdtempSync(join(tmpdir(), 'uh-oh-a-'));
  const dirB = mkdtempSync(join(tmpdir(), 'uh-oh-b-'));
  for (const dir of [dirA, dirB]) {
    execFileSync(process.execPath, ['main.ts'], {
      cwd: import.meta.dirname,
      env: { ...process.env, MAKEFUN_OUTPUT_DIR: dir },
    });
  }
  const a = readFileSync(join(dirA, 'entry.txt'));
  const b = readFileSync(join(dirB, 'entry.txt'));
  assert.ok(a.equals(b), 'entry.txt differs between runs');
  assert.equal(a.toString('utf8'), ENTRY);
  assert.ok(!a.toString('utf8').endsWith('\n'), 'no trailing newline');
});
