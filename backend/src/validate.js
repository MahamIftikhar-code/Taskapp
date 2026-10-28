const STATUSES = ['todo', 'doing', 'done'];
const MAX_TITLE_LENGTH = 120;

/**
 * Validates task input from a request body.
 * With `partial: true`, fields that are absent are skipped (used for updates).
 */
function validateTaskInput(body = {}, { partial = false } = {}) {
  const errors = [];
  const value = {};

  if (!partial || body.title !== undefined) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      errors.push('Title is required.');
    } else if (title.length > MAX_TITLE_LENGTH) {
      errors.push(`Title must be ${MAX_TITLE_LENGTH} characters or fewer.`);
    } else {
      value.title = title;
    }
  }

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      errors.push(`Status must be one of: ${STATUSES.join(', ')}.`);
    } else {
      value.status = body.status;
    }
  }

  return { value, errors };
}

module.exports = { validateTaskInput, STATUSES, MAX_TITLE_LENGTH };
