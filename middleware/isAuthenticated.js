const jwt = require("jsonwebtoken");

module.exports = function (req) {
  const token = req.cookies.auth_token;
  if (!token) return false;
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    return true;
  } catch (e) {
    return false;
  }
};
