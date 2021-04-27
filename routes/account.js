const router = require("express").Router();
const verify = require("../middleware/verifyToken");
const User = require("../models/User");

router.get("/", verify, async (req, res, next) => {
  user = await User.findById({ _id: req.user._id });
  res.send({
    user: {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    },
  });
  console.log(user);
});

module.exports = router;
