import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, loadState, saveState } from '../src/storage.js';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test('saves and restores profile and raw mark fields locally', () => {
  const storage = memoryStorage();
  const state = {
    sex: 'F', age: '46',
    marks: { flex: '23', plank: { minutes: '1', seconds: '30' }, run: { minutes: '11', seconds: '54' }, agility: '15.2' },
  };
  assert.equal(saveState(storage, state), true);
  assert.equal(storage.getItem(STORAGE_KEY) !== null, true);
  assert.deepEqual(loadState(storage), state);
});

test('ignores invalid or unavailable saved values safely', () => {
  const storage = memoryStorage();
  storage.setItem(STORAGE_KEY, '{not json');
  assert.equal(loadState(storage), null);
  assert.equal(saveState(null, { sex: 'M', age: '30', marks: {} }), false);
});
