const router = require("express").Router();

router.get(["/", "/home", "/homepage"], (req, res, next) => {
  // Render Home Page
  res.render("base/home", {
    pageTitle: "Home",
    path: "/",
    isAuthenticated: false,
    whateverVariable: "Whatever u wanna pass into the .ejs", // TODO: this is how u pass variables into the template view
  });
});

module.exports = router;
