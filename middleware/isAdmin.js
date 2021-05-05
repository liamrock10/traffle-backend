const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req) {
  const token = req.cookies.auth_token;
  if (!token) return false;
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    user = await User.findById({ _id: verified._id }).catch((e) => {
      console.log(e);
      return false;
    });
    if (user.type == "admin") {
      return true;
    } else if (user.type == "business") {
      return false;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
};
