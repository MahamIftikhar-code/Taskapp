const mongoose = require('mongoose');
const { STATUSES, MAX_TITLE_LENGTH } = require('../validate');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: MAX_TITLE_LENGTH },
    status: { type: String, enum: STATUSES, default: 'todo' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
