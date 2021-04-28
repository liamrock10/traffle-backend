const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registerValidation, loginValidation } = require("../validation");

router.post("/register", async (req, res, next) => {
  // Validate Data
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if User already exists
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists)
    return res.status(400).send("User with this email already exists.");

  // Check Password & Confirm Password
  if (req.body.password != req.body.confirm_password)
    res.status(400).send("Password and Confirm Password must be the same.");

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Create new User
  const user = new User({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    phone_number: req.body.phone_number,
    date_of_birth: req.body.date_of_birth,
    password: hashedPassword,
  });
  // Save User
  try {
    const savedUser = await user.save();
    res.send({ user: user._id });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/login", async (req, res, next) => {
  // Validate Data
  const { error } = loginValidation(req.body);
  console.log(req.body);
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
  res.header("auth_token", token).send({
    user: {
      id: user._id,
      name: user.first_name,
      email: user.email,
      auth_token: token,
    },
  });
});

router.post("/login", (req, res, next) => {
  res.send("Login!");
});

module.exports = router;
