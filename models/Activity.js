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
  //   price_level: {
  //     type: String,
  //     required: true,
  //   },
  rating: {
    type: Number,
    required: true,
  },
  //   formatted_address: {
  //     type: String,
  //     required: true,
  //   },
  photo: {
    photo_reference: {
      type: String,
    },
    height: {
      type: Number,
    },
    width: {
      type: Number,
      required: true,
    },
  },
});

module.exports = mongoose.model("Activity", activitySchema);
