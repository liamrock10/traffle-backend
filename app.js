const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Routes
const authRoute = require("./routes/auth");
const accountRoute = require("./routes/account");

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

// Route Middlewares
app.use("/api/user", authRoute);
app.use("/api/user", accountRoute);

app.listen(process.env.PORT, () => console.log("Server up!"));
