// models/Category.js

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  timer: {
    type: Number,
    required: true,
    default: 5, // default 5 minutes if admin doesn't set
  },
});

module.exports = mongoose.model("Category", categorySchema);
