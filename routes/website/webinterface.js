const router = require("express").Router();
const isAuthenticated = require("../../middleware/isAuthenticated");
const isAdmin = require("../../middleware/isAdmin");
const User = require("../../models/User");
const verify = require("../../middleware/verifyToken");

//***************************** ADMIN *******************************/

router.get("/admin", verify(), async (req, res, next) => {
  // ADMIN: Admin home Page
  res.render("admin/admin", {
    pageTitle: "Admin Home",
    path: "/",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
  });
});

//***************************** AUTH *******************************/

router.get("/login", async (req, res, next) => {
  // AUTH: Login Page
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
  });
});

router.get("/register", async (req, res, next) => {
  // AUTH: Register Page
  res.render("auth/register", {
    pageTitle: "Register",
    path: "/",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
  });
});

router.get("/recover-password", async (req, res, next) => {
  // AUTH: Reset Password Page
  res.render("auth/recover-password", {
    pageTitle: "Recover Password",
    path: "/",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
  });
});

//***************************** BASE *******************************/
router.get(["/", "/home", "/homepage"], async (req, res, next) => {
  // BASE: Home Page
  res.render("base/home", {
    pageTitle: "Home",
    path: "/",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
  });
});

router.get("/whatwedo", async (req, res, next) => {
  console.log(isAuthenticated(req));
  // BASE: What We Do Page
  res.render("base/whatwedo", {
    pageTitle: "What We Do",
    path: "/",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
  });
});

router.get("/prices", async (req, res, next) => {
  // BASE: Prices Page
  res.render("base/prices", {
    pageTitle: "Prices",
    path: "/",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
  });
});

router.get("/downloads", async (req, res, next) => {
  // BASE: Downloads Page
  res.render("base/downloads", {
    pageTitle: "Download Traffle",
    path: "/",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
  });
});

router.get("/privacy_policy", async (req, res, next) => {
  // BASE: Privacy Policy Page
  res.render("base/privacy_policy", {
    pageTitle: "Privacy Policy",
    path: "/",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
  });
});

router.get("/terms", async (req, res, next) => {
  // BASE: T&Cs Page
  res.render("base/terms", {
    pageTitle: "Terms and Conditions",
    path: "/",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
  });
});

//***************************** BUSINESS *******************************/

router.get("/account-details", verify(), async (req, res, next) => {
  // Get User
  user = await User.findById({ _id: req.user._id });
  // BUSINESS: Business settings Page
  res.render("account-details", {
    pageTitle: "Settings",
    path: "/",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
    user: user,
  });
});

module.exports = router;
