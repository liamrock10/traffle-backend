const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  itineraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Itinerary",
    required: true,
  },
  day: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    min: 1,
    max: 200,
  },
  place_id: {
    type: String,
    required: true,
    min: 1,
    max: 200,
  },
  rating: {
    type: Number,
  },
  photo: {
    photo_reference: {
      type: String,
    },
    height: {
      type: Number,
    },
    width: {
      type: Number,
    },
  },
  description: {
    type: String,
    min: 1,
    max: 500,
  },
  website: {
    type: String,
    min: 1,
    max: 500,
  },
  location: {
    type: String,
    min: 1,
    max: 500,
  },
  ad: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("Activity", activitySchema);
