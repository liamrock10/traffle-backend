const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const isAdmin = require("../../middleware/isAdmin");

//***************************** ADMIN *******************************/

router.get("/admin", (req, res, next) => {
  // ADMIN: Admin home Page
  res.render("admin/admin", {
    pageTitle: "Admin Home",
    path: "/",
    isAuthenticated: isAuthenticated(req),
    isAdmin: isAdmin(req),
  });
});

router.get("/settings", (req, res, next) => {
  // ADMIN: Admin home Page
  res.render("admin/settings", {
    pageTitle: "Settings",
    path: "/",
    isAuthenticated: isAuthenticated(req),
    isAdmin: isAdmin(req),
  });
});

router.get("/user-options", (req, res, next) => {
  // ADMIN: Admin home Page
  res.render("admin/user-options", {
    pageTitle: "User Options",
    path: "/",
    isAuthenticated: false,
    whateverVariable: "Whatever u wanna pass into the .ejs", // TODO: this is how u pass variables into the template view
  });
});

//***************************** AUTH *******************************/

router.get("/login", (req, res, next) => {
  // AUTH: Login Page
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/",
    isAuthenticated: isAuthenticated(req),
    isAdmin: isAdmin(req),
  });
});

router.get("/register", (req, res, next) => {
  // AUTH: Register Page
  res.render("auth/register", {
    pageTitle: "Register",
    path: "/",
    isAuthenticated: isAuthenticated(req),
    isAdmin: isAdmin(req),
  });
});

router.get("/recover-password", (req, res, next) => {
  // AUTH: Reset Password Page
  res.render("auth/recover-password", {
    pageTitle: "Recover Password",
    path: "/",
    isAuthenticated: isAuthenticated(req),
    isAdmin: isAdmin(req),
  });
});

router.get("/reset-password", (req, res, next) => {
  // AUTH: Reset Password  Page
  res.render("auth/reset-password", {
    pageTitle: "Reset Password",
    path: "/",
    isAuthenticated: isAuthenticated(req),
    isAdmin: isAdmin(req),
  });
});

//***************************** BASE *******************************/
router.get(["/", "/home", "/homepage"], (req, res, next) => {
  // BASE: Home Page
  res.render("base/home", {
    pageTitle: "Home",
    path: "/",
    isAuthenticated: isAuthenticated(req),
    isAdmin: isAdmin(req),
  });
});

router.get("/whatwedo", (req, res, next) => {
  console.log(isAuthenticated(req));
  // BASE: What We Do Page
  res.render("base/whatwedo", {
    pageTitle: "What We Do",
    path: "/",
    isAuthenticated: isAuthenticated(req),
    isAdmin: isAdmin(req),
  });
});

router.get("/prices", (req, res, next) => {
  // BASE: Prices Page
  res.render("base/prices", {
    pageTitle: "Prices",
    path: "/",
    isAuthenticated: isAuthenticated(req),
    isAdmin: isAdmin(req),
  });
});

router.get("/downloads", (req, res, next) => {
  // BASE: Downloads Page
  res.render("base/downloads", {
    pageTitle: "Download Traffle",
    path: "/",
    isAuthenticated: isAuthenticated(req),
    isAdmin: isAdmin(req),
  });
});

router.get("/privacy_policy", (req, res, next) => {
  // BASE: Privacy Policy Page
  res.render("base/privacy_policy", {
    pageTitle: "Privacy Policy",
    path: "/",
    isAuthenticated: isAuthenticated(req),
    isAdmin: isAdmin(req),
  });
});

router.get("/terms", (req, res, next) => {
  // BASE: T&Cs Page
  res.render("base/terms", {
    pageTitle: "Terms and Conditions",
    path: "/",
    isAuthenticated: isAuthenticated(req),
    isAdmin: isAdmin(req),
  });
});

//***************************** BUSINESS *******************************/

router.get("/business", (req, res, next) => {
  // BUSINESS: Business home Page
  res.render("business/home", {
    pageTitle: "Home",
    path: "/",
    isAuthenticated: isAuthenticated(req),
    isAdmin: isAdmin(req),
  });
});

router.get("/business-settings", (req, res, next) => {
  // BUSINESS: Business settings Page
  res.render("business/settings", {
    pageTitle: "Settings",
    path: "/",
    isAuthenticated: isAuthenticated(req),
    isAdmin: isAdmin(req),
  });
});

module.exports = router;
