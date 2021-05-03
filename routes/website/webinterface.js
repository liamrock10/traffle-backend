const router = require("express").Router();

router.get(["/", "/home", "/homepage"], (req, res, next) => {
  // BASE: Home Page
  res.render("base/home", {
    pageTitle: "Home",
    path: "/",
    isAuthenticated: false,
    whateverVariable: "Whatever u wanna pass into the .ejs", // TODO: this is how u pass variables into the template view
  });
});

router.get(["/", "/whatwedo", "/whatwedo"], (req, res, next) => {
  // BASE: What We Do Page
  res.render("base/whatwedo", {
    pageTitle: "What We Do",
    path: "/",
    isAuthenticated: false,
    whateverVariable: "Whatever u wanna pass into the .ejs", // TODO: this is how u pass variables into the template view
  });
});

router.get(["/", "/prices", "/prices"], (req, res, next) => {
  // BASE: Prices Page
  res.render("base/prices", {
    pageTitle: "Prices",
    path: "/",
    isAuthenticated: false,
    whateverVariable: "Whatever u wanna pass into the .ejs", // TODO: this is how u pass variables into the template view
  });
});

router.get(["/", "/downloads", "/downloads"], (req, res, next) => {
  // BASE: Downloads Page
  res.render("base/downloads", {
    pageTitle: "Download Traffle",
    path: "/",
    isAuthenticated: false,
    whateverVariable: "Whatever u wanna pass into the .ejs", // TODO: this is how u pass variables into the template view
  });
});

router.get(["/", "/admin", "/admin"], (req, res, next) => {
  // ADMIN: Login Page
  res.render("admin/admin", {
    pageTitle: "Login",
    path: "/",
    isAuthenticated: false,
    whateverVariable: "Whatever u wanna pass into the .ejs", // TODO: this is how u pass variables into the template view
  });
});

router.get(["/", "/register", "/register"], (req, res, next) => {
  // ADMIN: Register Page
  res.render("admin/register", {
    pageTitle: "Register",
    path: "/",
    isAuthenticated: false,
    whateverVariable: "Whatever u wanna pass into the .ejs", // TODO: this is how u pass variables into the template view
  });
});

module.exports = router;
