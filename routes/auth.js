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
  if (error) return res.status(400).send(error.details[0].message);

  // Check user type
  if (req.body.type != "regular" && req.body.type != "business") {
    return res.status(400).send("Invalid user type.");
  }

  // Check if User already exists
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists)
    return res.status(400).send("User with this email already exists.");

  // Check Password & Confirm Password
  if (req.body.password != req.body.confirm_password)
    return res
      .status(400)
      .send("Password and Confirm Password must be the same.");

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
      .then(res.status(201).send({ user: user._id }))
      .catch((e) => {
        res.status(400).send(e);
      });
  } else if (req.body.type == "business") {
    // Create Business User
    if (req.body.organisation_name == null) {
      return res.status(400).send("Please provide organisation name.");
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
      .then(res.status(201).send({ user: user._id }))
      .catch((e) => {
        res.status(400).send(e);
      });
  }
});

router.post("/login", async (req, res, next) => {
  // Validate Data
  const { error } = loginValidation(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  // Check if User exists
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res
      .status(400)
      .send("You have entered an invalid email or password.");

  // Check Password
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass)
    return res
      .status(400)
      .send("You have entered an invalid email or password.");

  // Create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: "10d", // TODO change to 1h
  });
  console.log(req.useragent);
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
  if (error) return res.status(400).send(error.details[0].message);
  // Create reset token
  crypto.randomBytes(32, (e, buffer) => {
    if (e) {
      console.log(e);
      return res.send("An error occured.");
    }
    const token = buffer.toString("hex");
    // Find user associated with email
    User.findOne({ email: req.body.email })
      .then((user) => {
        // Check if user exists
        if (user == null) {
          return res.send("No account associated with that email.");
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
          .then(res.send("Password reset link sent."))
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((e) => {
        console.log(e);
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
      console.log(e);
    });
});

router.post("/reset-new-password", async (req, res, next) => {
  // Validate Data
  const { error } = newPasswordResetValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
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
      return res.send("Password successfully updated.");
    })
    .catch((e) => {
      console.log(e);
    });
});

module.exports = router;
