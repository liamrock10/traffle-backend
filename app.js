// Imports
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Creates application
const app = express();

// Templating View Engine
app.set("view engine", "ejs");
app.set("views", "views");

// Routes
const authRoute = require("./routes/auth");
const accountRoute = require("./routes/account");
const itinerariesRoute = require("./routes/itineraries");
const websiteRoute = require("./routes/website/base");

// Environment Variables Setup
dotenv.config();

// Connect to Database
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to DB");
  }
);

// Middlewares
app.use(express.json());
app.use(express.static("public"));

// Route Middlewares
app.use("/api/user", authRoute);
app.use("/api/user", accountRoute);
app.use("/api/itineraries", itinerariesRoute);
// Web-Interface Routes
app.use("/", websiteRoute);

app.listen(process.env.PORT, () => console.log("Server up!"));
