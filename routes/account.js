const router = require("express").Router();
const verify = require("../middleware/verifyToken");
const User = require("../models/User");

router.get("/", verify, async (req, res, next) => {
  user = await User.findById({ _id: req.user._id });
  res.send(user.name);
  console.log(user);
});

module.exports = router;
