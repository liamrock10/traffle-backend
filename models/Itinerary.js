const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  location: {
    type: String,
    required: true,
    min: 1,
    max: 200,
  },
  coordinates: {
    type: String,
    required: true,
    min: 1,
    max: 200,
  },
  // budget: { MOSCOW Could
  //   type: Number,
  //   required: true,
  //   min: 50,
  //   max: 1000000,
  // },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 30,
  },
  radius: {
    type: Number,
    required: true,
    min: 500,
    max: 25000,
  },
  activities: [
    {
      activityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Itinerary", itinerarySchema);
