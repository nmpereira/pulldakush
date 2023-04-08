const mongoose = require("mongoose");

const LogsSchema = new mongoose.Schema({
  log: {
    type: Array,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Log", LogsSchema);
