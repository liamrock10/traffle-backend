const Joi = require("joi");

// Register Validation
let ageCap = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 16);
const registerValidation = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().min(1).max(20).required(),
    last_name: Joi.string().min(1).max(20).required(),
    email: Joi.string().min(6).max(50).email().required(),
    phone_number: Joi.string().min(11).max(11).required(), // TODO add phone number validation
    date_of_birth: Joi.date().max(ageCap).required(),
    password: Joi.string().min(8).max(1024).required(),
    confirm_password: Joi.ref("password"),
    type: Joi.string().min(1).max(20).required(),
    organisation_name: Joi.string().min(1).max(50),
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

// Create Itinerary Validation
const itineraryValidation = (data) => {
  const schema = Joi.object({
    location: Joi.string().min(2).max(200).required(),
    budget: Joi.number().min(50).max(1000000).required(),
    duration: Joi.number().min(1).max(30).required(),
    radius: Joi.number().min(500).max(25000).required(),
    nightlife: Joi.boolean().required(),
    daylife: Joi.boolean().required(),
    food: Joi.boolean().required(),
    accommodation: Joi.boolean().required(),
  });
  return schema.validate(data);
};

// Update User Validation
const updateUserValidation = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().min(1).max(20).required(),
    last_name: Joi.string().min(1).max(20).required(),
    email: Joi.string().min(6).max(50).email().required(),
    phone_number: Joi.string().min(7).max(10).required(),
    date_of_birth: Joi.date().max(ageCap).required(),
    password: Joi.string().min(8).max(1024),
    organisation_name: Joi.string().min(1).max(50),
  });
  return schema.validate(data);
};

// Reset Password Validation
const resetPasswordValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(50).email().required(),
  });
  return schema.validate(data);
};

// New Password Reset Validation
const newPasswordResetValidation = (data) => {
  const schema = Joi.object({
    password: Joi.string().min(8).max(1024).required(),
    confirm_password: Joi.ref("password"),
    userId: Joi.string().required(),
    passToken: Joi.string().required(),
  });
  return schema.validate(data);
};

// Create Campaign Validation
const createCampaignValidation = (data) => {
  const schema = Joi.object({
    total_views: Joi.number().min(1).max(10000000).required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    name: Joi.string().min(1).max(200).required(),
    location: Joi.string().min(1).max(500).required(),
    description: Joi.string().min(1).max(500).required(),
    website: Joi.string().min(1).max(500).required(),
    type: Joi.string().min(1).max(20).required(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.itineraryValidation = itineraryValidation;
module.exports.updateUserValidation = updateUserValidation;
module.exports.resetPasswordValidation = resetPasswordValidation;
module.exports.newPasswordResetValidation = newPasswordResetValidation;
module.exports.createCampaignValidation = createCampaignValidation;
