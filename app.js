// Imports
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const useragent = require("express-useragent");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const session = require("express-session");

// Creates application
const app = express();

// Templating View Engine
app.set("view engine", "ejs");
app.set("views", "views");

// Routes
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const itinerariesRoute = require("./routes/itineraries");
const websiteRoute = require("./routes/website/webinterface");

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
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(useragent.express());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  })
);
app.use(flash());

// Route Middlewares
app.use("/api/user", authRoute);
app.use("/api/user", userRoute);
app.use("/api/itineraries", itinerariesRoute);
// Web-Interface Routes
app.use("/", websiteRoute);

// Error controller
app.use((req, res, next) => {
  res.status(404).render("404", {
    pageTitle: "Page Not Found",
  });
});

app.listen(process.env.PORT, () => console.log("Server up!"));
