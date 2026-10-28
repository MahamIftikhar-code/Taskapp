const test = require('node:test');
const assert = require('node:assert/strict');
const { validateTaskInput } = require('../src/validate');

test('accepts a valid new task and trims the title', () => {
  const { value, errors } = validateTaskInput({ title: '  Write Dockerfile  ' });
  assert.deepEqual(errors, []);
  assert.equal(value.title, 'Write Dockerfile');
});

test('rejects a missing or blank title', () => {
  assert.equal(validateTaskInput({}).errors.length, 1);
  assert.equal(validateTaskInput({ title: '   ' }).errors.length, 1);
});

test('rejects a title longer than 120 characters', () => {
  const { errors } = validateTaskInput({ title: 'a'.repeat(121) });
  assert.equal(errors.length, 1);
});

test('rejects an unknown status', () => {
  const { errors } = validateTaskInput({ title: 'Task', status: 'archived' });
  assert.equal(errors.length, 1);
});

test('partial updates allow status without title', () => {
  const { value, errors } = validateTaskInput({ status: 'done' }, { partial: true });
  assert.deepEqual(errors, []);
  assert.equal(value.status, 'done');
});
