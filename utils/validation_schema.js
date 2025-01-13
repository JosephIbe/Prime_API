const Joi = require('joi');

const registerSchema = Joi.object({
    firstName: Joi.string().lowercase().min(2).max(10).required(),
    lastName: Joi.string().lowercase().min(2).max(15).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).max(15),
});

const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(6).max(15)
});

module.exports = {
    registerSchema,
    loginSchema
}