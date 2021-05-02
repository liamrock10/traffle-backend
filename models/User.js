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
  type: {
    type: String,
    required: true,
    min: 1,
    max: 20,
  },
  organisation_name: {
    type: String,
    min: 1,
    max: 50,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  itineraries: [
    {
      itineraryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Itinerary",
        required: true,
      },
    },
  ],
  resetToken: { type: String },
  resetTokenExpiration: { type: Date },
});

module.exports = mongoose.model("User", userSchema);
