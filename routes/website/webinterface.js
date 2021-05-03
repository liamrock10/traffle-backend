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

router.get("/whatwedo", (req, res, next) => {
  // BASE: What We Do Page
  res.render("base/whatwedo", {
    pageTitle: "What We Do",
    path: "/",
    isAuthenticated: false,
    whateverVariable: "Whatever u wanna pass into the .ejs", // TODO: this is how u pass variables into the template view
  });
});

router.get("/prices", (req, res, next) => {
  // BASE: Prices Page
  res.render("base/prices", {
    pageTitle: "Prices",
    path: "/",
    isAuthenticated: false,
    whateverVariable: "Whatever u wanna pass into the .ejs", // TODO: this is how u pass variables into the template view
  });
});

router.get("/downloads", (req, res, next) => {
  // BASE: Downloads Page
  res.render("base/downloads", {
    pageTitle: "Download Traffle",
    path: "/",
    isAuthenticated: false,
    whateverVariable: "Whatever u wanna pass into the .ejs", // TODO: this is how u pass variables into the template view
  });
});

router.get("/admin", (req, res, next) => {
  // ADMIN: Login Page
  res.render("admin/admin", {
    pageTitle: "Login",
    path: "/",
    isAuthenticated: false,
    whateverVariable: "Whatever u wanna pass into the .ejs", // TODO: this is how u pass variables into the template view
  });
});

router.get("/register", (req, res, next) => {
  // ADMIN: Register Page
  res.render("admin/register", {
    pageTitle: "Register",
    path: "/",
    isAuthenticated: false,
    whateverVariable: "Whatever u wanna pass into the .ejs", // TODO: this is how u pass variables into the template view
  });
});

router.get("/privacy_policy", (req, res, next) => {
  // ADMIN: Register Page
  res.render("admin/privacy_policy", {
    pageTitle: "Privacy Policy",
    path: "/",
    isAuthenticated: false,
    whateverVariable: "Whatever u wanna pass into the .ejs", // TODO: this is how u pass variables into the template view
  });
});

router.get("/terms", (req, res, next) => {
  // ADMIN: Register Page
  res.render("admin/terms", {
    pageTitle: "Terms and Conditions",
    path: "/",
    isAuthenticated: false,
    whateverVariable: "Whatever u wanna pass into the .ejs", // TODO: this is how u pass variables into the template view
  });
});

// Sends error page as response when at invalid page
// exports.get404 = (req, res, next) => {
//   res.status(404).render("404");
// };


module.exports = router;
