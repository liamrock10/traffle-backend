const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  return (req, res, next) => {
    if (
      // Called from Android App
      req.useragent.browser == "PostmanRuntime" ||
      req.useragent.browser == "okhttp"
    ) {
      const token = req.header("auth_token");
      if (!token) return res.status(401).send("Access Denied.");

      try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log(verified);
        req.user = verified;
        next();
      } catch (e) {
        res.status(400).send("Invalid Token.");
      }
    } else {
      // From browsers
      const token = req.cookies.auth_token;
      if (!token)
        return res.status(401).render("auth/login", {
          pageTitle: "Login",
          path: "/",
          isAuthenticated: false,
        });

      try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
      } catch (e) {
        res.status(400).render("auth/login", {
          pageTitle: "Login",
          path: "/",
          isAuthenticated: false,
        });
      }
    }
  };
};
