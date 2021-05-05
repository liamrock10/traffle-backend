const router = require("express").Router();
const verify = require("../middleware/verifyToken");
const fetch = require("node-fetch");
const User = require("../models/User");
const Activity = require("../models/Activity");
const { itineraryValidation } = require("../validation");

// All Campagins
router.get("/", verify(), async (req, res, next) => {
  // Get User
  user = await User.findById({ _id: req.user._id });
  // Get All Campagins
  // Send back Campagins
  res.send("all campaigns for " + user.first_name);
});

module.exports = router;
