const Joi = require("joi");

// Register Validation
const registerValidation = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().min(1).max(20).required(),
    last_name: Joi.string().min(1).max(20).required(),
    email: Joi.string().min(6).max(50).email().required(),
    password: Joi.string().min(8).max(1024).required(),
    confirm_password: Joi.string().min(8).max(1024).required(),
  });
  return schema.validate(data);
};

// Login Validation
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(50).email().required(),
    password: Joi.string().min(8).max(1024).required(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
