const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  total_views: {
    // Total views bought
    type: Number,
    required: true,
    min: 1,
    max: 10000000,
  },
  views: {
    // Times viewed
    type: Number,
    required: true,
    min: 0,
    max: 10000000,
  },
  views_today: {
    // Times viewed today
    type: Number,
    required: true,
    min: 0,
    max: 10000000,
  },
  views_today_date: {
    // Times viewed today
    type: Date,
    required: true,
  },
  daily_views_max: {
    // Max views per day
    type: Number,
    required: true,
    min: 1,
    max: 10000000,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  cost: {
    // Total cost of campaign
    type: Number,
    required: true,
    min: 0.1,
    max: 10000000,
  },
  // The CAMPAIGN ACTIVITY -------------------------------
  name: {
    type: String,
    required: true,
    min: 1,
    max: 200,
  },
  organisation_name: {
    type: String,
    required: true,
    min: 1,
    max: 200,
  },
  location: {
    type: String,
    required: true,
    min: 1,
    max: 500,
  },
  coordinates: {
    type: String,
    required: true,
    min: 1,
    max: 200,
  },
  description: {
    type: String,
    required: true,
    min: 1,
    max: 500,
  },
  website: {
    type: String,
    required: true,
    min: 1,
    max: 500,
  },
  place_id: {
    type: String,
    required: true,
    min: 1,
    max: 200,
  },
  rating: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  confirmed: { type: Boolean, required: true },
  active: { type: Boolean, required: true },
  complete: { type: Boolean, required: true },
});

module.exports = mongoose.model("Campaign", campaignSchema);
