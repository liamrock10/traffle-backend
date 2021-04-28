const Joi = require("joi");

// Register Validation
let ageCap = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 16);

const registerValidation = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().min(1).max(20).required(),
    last_name: Joi.string().min(1).max(20).required(),
    email: Joi.string().min(6).max(50).email().required(),
    phone_number: Joi.string().min(7).max(10).required(), // TODO add phone number validation
    date_of_birth: Joi.date().max(ageCap).required(),
    password: Joi.string().min(8).max(1024).required(),
    confirm_password: Joi.ref("password"),
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
