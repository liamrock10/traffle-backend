const router = require("express").Router();
const verify = require("../middleware/verifyToken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { updateUserValidation } = require("../validation");

// Get User Details
router.get("/", verify, async (req, res, next) => {
  // Get User
  user = await User.findById({ _id: req.user._id });
  // Send back User Data
  return res.send(user);
});

// Update User Details
router.put("/update-details", verify, async (req, res, next) => {
  // Validate Data
  const { error } = updateUserValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  // Get User
  user = await User.findById({ _id: req.user._id });
  // Update User Details
  if (user.type == "regular") {
    User.findById(user)
      .then((userToUpdate) => {
        userToUpdate.first_name = req.body.first_name;
        userToUpdate.last_name = req.body.last_name;
        userToUpdate.email = req.body.email;
        userToUpdate.phone_number = req.body.phone_number;
        userToUpdate.date_of_birth = req.body.date_of_birth;
        return userToUpdate.save();
      })
      .then((result) => {
        console.log("User details updated.");
        res.send("user updated");
      })
      .catch((e) => {
        console.log(e);
      });
  } else if (user.type == "business") {
    User.findById(user)
      .then((userToUpdate) => {
        userToUpdate.first_name = req.body.first_name;
        userToUpdate.last_name = req.body.last_name;
        userToUpdate.email = req.body.email;
        userToUpdate.phone_number = req.body.phone_number;
        userToUpdate.date_of_birth = req.body.date_of_birth;
        userToUpdate.organisation_name = req.body.organisation_name;
        return userToUpdate.save();
      })
      .then((result) => {
        console.log("User details updated.");
        res.send("user updated");
      })
      .catch((e) => {
        console.log(e);
      });
  }
});

// Delete User
router.delete("/delete-account", verify, async (req, res, next) => {
  // Get User
  user = await User.findById({ _id: req.user._id });
  // Check Password
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass)
    return res.status(400).send("Please enter the correct password.");
  User.findOneAndDelete({ _id: user })
    .then((result) => {
      console.log("User deleted");
      res.send("user deleted");
    })
    .catch((e) => {
      console.log(e);
    });
});

module.exports = router;
