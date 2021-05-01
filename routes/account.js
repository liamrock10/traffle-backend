const router = require("express").Router();
const verify = require("../middleware/verifyToken");
const User = require("../models/User");

router.get("/", verify, async (req, res, next) => {
  // Get User
  user = await User.findById({ _id: req.user._id });
  // Send back User Data
  res.send({
    user: {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      date_of_birth: user.date_of_birth,
    },
  });
  console.log(user);
});

module.exports = router;
