const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    min: 1,
    max: 20,
  },
  last_name: {
    type: String,
    required: true,
    min: 1,
    max: 20,
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 50,
  },
  phone_number: {
    type: String,
    required: true,
    min: 7,
    max: 10,
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  password: {
    type: String,
    required: true,
    min: 8,
    max: 1024,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
