const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
const {
  registerValidation,
  loginValidation,
  resetPasswordValidation,
  newPasswordResetValidation,
} = require("../validation");

// Environment Variables Setup
dotenv.config();

// SendGrid config
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post("/register", async (req, res, next) => {
  // Validate Data
  const { error } = registerValidation(req.body);
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
      return res.status(400).redirect("/register");
    }
  }

  // Check user type
  if (req.body.type != "regular" && req.body.type != "business") {
    // Android App
    if (
      req.useragent.browser == "okhttp" ||
      req.useragent.browser == "PostmanRuntime"
    ) {
      return res.status(400).send("Invalid User Type.");
    } else {
      // Browser
      req.flash("error", "Invalid User Type.");
      return res.status(400).redirect("/register");
    }
  }

  // Check if User already exists
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    // Android App
    if (
      req.useragent.browser == "okhttp" ||
      req.useragent.browser == "PostmanRuntime"
    ) {
      return res.status(400).send("User with this email already exists.");
    } else {
      // Browser
      req.flash("error", "User with this email already exists.");
      return res.status(400).redirect("/register");
    }
  }

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Create Regular User
  if (req.body.type == "regular") {
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone_number: req.body.phone_number,
      date_of_birth: req.body.date_of_birth,
      password: hashedPassword,
      type: req.body.type,
      itineraries: [],
    });
    // Save User
    const savedUser = await user
      .save()
      .then((result) => {
        sgMail.send({
          to: user.email,
          from: "traffle2021@gmail.com",
          subject: "Signup Confirmation",
          text: user.first_name + " | Signup was successful!",
          html: "<h1>" + user.first_name + " | Signup was successful!</h1>",
        });
      })
      .then((result) => {
        // Android App
        if (
          req.useragent.browser == "okhttp" ||
          req.useragent.browser == "PostmanRuntime"
        ) {
          return res.status(201).send({ user: user._id });
        } else {
          // Browser
          req.flash("success", "Signup was successful.");
          return res.status(201).redirect("/login");
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
          req.flash("error", "An error occurred.");
          console.log(e);
          return res.status(400).redirect("/register");
        }
      });
  } else if (req.body.type == "business") {
    // Create Business User
    if (req.body.organisation_name == null) {
      req.flash("error", "Please provide organisation name.");
      return res.status(400).redirect("/register");
    }
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone_number: req.body.phone_number,
      date_of_birth: req.body.date_of_birth,
      password: hashedPassword,
      type: req.body.type,
      organisation_name: req.body.organisation_name,
    });
    // Save User
    const savedUser = await user
      .save()
      .then((result) => {
        sgMail.send({
          to: user.email,
          from: "traffle2021@gmail.com",
          subject: "Signup Confirmation",
          text: user.first_name + " | Signup was successful!",
          html: "<h1>" + user.first_name + " | Signup was successful!</h1>",
        });
      })
      .then((result) => {
        // Android App
        if (
          req.useragent.browser == "okhttp" ||
          req.useragent.browser == "PostmanRuntime"
        ) {
          return res.status(201).send({ user: user._id });
        } else {
          // Browser
          req.flash("success", "Signup was successful.");
          return res.status(201).redirect("/login");
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
          req.flash("error", "An error occurred.");
          console.log(e);
          return res.status(400).redirect("/register");
        }
      });
  }
});

router.post("/login", async (req, res, next) => {
  // Validate Data
  const { error } = loginValidation(req.body);
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
      return res.status(400).redirect("/login");
    }
  }

  // Check if User exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Android App
    if (
      req.useragent.browser == "okhttp" ||
      req.useragent.browser == "PostmanRuntime"
    ) {
      return res
        .status(400)
        .send("You have entered an invalid email or password.");
    } else {
      // Browser
      req.flash("error", "You have entered an invalid email or password.");
      return res.status(400).redirect("/login");
    }
  }

  // Check Password
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) {
    // Android App
    if (
      req.useragent.browser == "okhttp" ||
      req.useragent.browser == "PostmanRuntime"
    ) {
      return res
        .status(400)
        .send("You have entered an invalid email or password.");
    } else {
      // Browser
      req.flash("error", "You have entered an invalid email or password.");
      return res.status(400).redirect("/login");
    }
  }

  // Create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: "10d", // TODO change to 1h
  });

  // Request from Android App
  if (
    req.useragent.browser == "okhttp" ||
    req.useragent.browser == "PostmanRuntime"
  ) {
    res.header("auth_token", token).send({
      user: {
        id: user._id,
        name: user.first_name,
        email: user.email,
        auth_token: token,
      },
    });
  } else {
    // Request from Browser
    res.cookie("auth_token", token, {
      httponly: true,
    });
    res.redirect("/");
  }
});

router.post("/reset-password", (req, res, next) => {
  // Validate Data
  const { error } = resetPasswordValidation(req.body);
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
      return res.status(400).redirect("/recover-password");
    }
  }
  // Create reset token
  crypto.randomBytes(32, (e, buffer) => {
    if (e) {
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
        return res.status(400).redirect("/recover-password");
      }
    }
    const token = buffer.toString("hex");
    // Find user associated with email
    User.findOne({ email: req.body.email })
      .then((user) => {
        // Check if user exists
        if (user == null) {
          // Android App
          if (
            req.useragent.browser == "okhttp" ||
            req.useragent.browser == "PostmanRuntime"
          ) {
            return res.send("No account associated with that email.");
          } else {
            // Browser
            req.flash("error", "No account associated with that email.");
            return res.status(400).redirect("/recover-password");
          }
        }
        // Store reset token in database
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        user.save();
        // Send Password Reset email
        sgMail
          .send({
            to: req.body.email,
            from: "traffle2021@gmail.com",
            subject: "Password Reset",
            html: `
          <h1>Password Reset</h1>
          <p>Click here to <a href="https://traffle-backend-nws7l.ondigitalocean.app/api/user/reset-password/${token}">change password</a>.</p>
          <p>Password reset link is only valid for 1 hour.</p>
          `,
          })
          .then((result) => {
            // Android App
            if (
              req.useragent.browser == "okhttp" ||
              req.useragent.browser == "PostmanRuntime"
            ) {
              return res.send("Password reset link sent.");
            } else {
              // Browser
              req.flash("success", "Password reset link sent.");
              return res.status(200).redirect("/recover-password");
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
              return res.status(400).redirect("/recover-password");
            }
          });
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
          return res.status(400).redirect("/recover-password");
        }
      });
  });
});

router.get("/reset-password/:token", (req, res, next) => {
  // Get Token
  const token = req.params.token;
  // Find User
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      // Render Home Page
      res.render("auth/reset-password", {
        pageTitle: "Reset Password",
        path: "/reset-password",
        isAuthenticated: false,
        userId: user._id,
        passToken: token,
      });
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
        return res.status(400).redirect("/recover-password");
      }
    });
});

router.post("/reset-new-password", async (req, res, next) => {
  // Validate Data
  const { error } = newPasswordResetValidation(req.body);
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
      return res.status(400).redirect("/reset-new-password");
    }
  }
  // Get Data
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passToken = req.body.passToken;
  // Hash New Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  // Find User
  User.findOne({
    resetToken: passToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      // Update User Password
      user.password = hashedPassword;
      user.resetToken = null;
      user.resetTokenExpiration = undefined;
      user.save();
      // Android App
      if (
        req.useragent.browser == "okhttp" ||
        req.useragent.browser == "PostmanRuntime"
      ) {
        return res.send("Password successfully updated.");
      } else {
        // Browser
        req.flash("success", "Password successfully updated.");
        return res.status(201).redirect("/reset-new-password");
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
        return res.status(400).redirect("/reset-new-password");
      }
    });
});

router.get("/logout", (req, res, next) => {
  // Clears Auth JWT
  res.status(202).clearCookie("auth_token").redirect("/");
});

module.exports = router;
