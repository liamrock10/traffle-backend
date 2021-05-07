const router = require("express").Router();
const verify = require("../middleware/verifyToken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { updateUserValidation } = require("../validation");
const dateFormat = require("dateformat"); // test date stuff TODO: Delete

// Get User Details
router.get("/", verify(), async (req, res, next) => {
  // Get User
  user = await User.findById({ _id: req.user._id });
  // Send back User Data
  return res.send(user);
});

// Update User Details
router.post("/update-details", verify(), async (req, res, next) => {
  // Validate Data
  const { error } = updateUserValidation(req.body);
  if (error) {
    // Android App
    if (
      req.useragent.browser == "okhttp" ||
      req.useragent.browser == "PostmanRuntime"
    ) {
      return res.status(400).send(error.details[0].message);
    } else {
      // Browser
      req.flash("error", error.details[0].message);
      return res.status(400).redirect("/account-details");
    }
  }
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
        return userToUpdate.save();
      })
      .then((result) => {
        console.log("User details updated.");
        // Android App
        if (
          req.useragent.browser == "okhttp" ||
          req.useragent.browser == "PostmanRuntime"
        ) {
          return res.send("User details updated.");
        } else {
          // Browser
          req.flash("success", "User details updated.");
          return res.status(200).redirect("/account-details");
        }
      })
      .catch((e) => {
        // Android App
        if (
          req.useragent.browser == "okhttp" ||
          req.useragent.browser == "PostmanRuntime"
        ) {
          console.log(e);
          return res.status(400).send("An error occurred.");
        } else {
          // Browser
          console.log(e);
          req.flash("error", "An error occurred.");
          return res.status(400).redirect("/account-details");
        }
      });
  } else if (user.type == "business") {
    User.findById(user)
      .then((userToUpdate) => {
        userToUpdate.first_name = req.body.first_name;
        userToUpdate.last_name = req.body.last_name;
        userToUpdate.email = req.body.email;
        userToUpdate.phone_number = req.body.phone_number;
        userToUpdate.organisation_name = req.body.organisation_name;
        return userToUpdate.save();
      })
      .then((result) => {
        console.log("User details updated.");
        // Android App
        if (
          req.useragent.browser == "okhttp" ||
          req.useragent.browser == "PostmanRuntime"
        ) {
          return res.send("User details updated.");
        } else {
          // Browser
          req.flash("success", "User details updated.");
          return res.status(200).redirect("/account-details");
        }
      })
      .catch((e) => {
        // Android App
        if (
          req.useragent.browser == "okhttp" ||
          req.useragent.browser == "PostmanRuntime"
        ) {
          console.log(e);
          return res.status(400).send("An error occurred.");
        } else {
          // Browser
          console.log(e);
          req.flash("error", "An error occurred.");
          return res.status(400).redirect("/account-details");
        }
      });
  } else if (user.type == "admin") {
    User.findById(user)
      .then((userToUpdate) => {
        userToUpdate.first_name = req.body.first_name;
        userToUpdate.last_name = req.body.last_name;
        userToUpdate.email = req.body.email;
        userToUpdate.phone_number = req.body.phone_number;
        return userToUpdate.save();
      })
      .then((result) => {
        console.log("User details updated.");
        // Android App
        if (
          req.useragent.browser == "okhttp" ||
          req.useragent.browser == "PostmanRuntime"
        ) {
          return res.send("User details updated.");
        } else {
          // Browser
          req.flash("success", "User details updated.");
          return res.status(200).redirect("/account-details");
        }
      })
      .catch((e) => {
        // Android App
        if (
          req.useragent.browser == "okhttp" ||
          req.useragent.browser == "PostmanRuntime"
        ) {
          console.log(e);
          return res.status(400).send("An error occurred.");
        } else {
          // Browser
          console.log(e);
          req.flash("error", "An error occurred.");
          return res.status(400).redirect("/account-details");
        }
      });
  }
});

// Delete User
router.delete("/delete-account", verify(), async (req, res, next) => {
  // Get User
  user = await User.findById({ _id: req.user._id });
  // Check Password
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) {
    // Android App
    if (
      req.useragent.browser == "okhttp" ||
      req.useragent.browser == "PostmanRuntime"
    ) {
      return res.status(400).send("Please enter the correct password.");
    } else {
      // Browser
      req.flash("error", "Please enter the correct password.");
      return res.status(200).redirect("/account-details");
    }
  }
  User.findOneAndDelete({ _id: user })
    .then((result) => {
      console.log("User deleted");
      // Android App
      if (
        req.useragent.browser == "okhttp" ||
        req.useragent.browser == "PostmanRuntime"
      ) {
        return res.send("Account deleted.");
      } else {
        // Browser
        req.flash("success", "Account deleted.");
        return res.status(202).clearCookie("auth_token").redirect("/");
      }
    })
    .catch((e) => {
      // Android App
      if (
        req.useragent.browser == "okhttp" ||
        req.useragent.browser == "PostmanRuntime"
      ) {
        console.log(e);
        return res.status(400).send("An error occurred.");
      } else {
        // Browser
        console.log(e);
        req.flash("error", "An error occurred.");
        return res.status(400).redirect("/account-details");
      }
    });
});

module.exports = router;
