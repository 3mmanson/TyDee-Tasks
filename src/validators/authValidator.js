const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'Username cannot be empty',
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username must not exceed 50 characters',
    'any.required': 'Username is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const requestResetSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  })
});

const validateRequestReset = (data) => {
  return requestResetSchema.validate(data, { abortEarly: false });
};

const validateResetPassword = (data) => {
  return resetPasswordSchema.validate(data, { abortEarly: false });
};

const validateRegister = (data) => {
  return registerSchema.validate(data, { abortEarly: false });
};

const validateLogin = (data) => {
  return loginSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateRegister,
  validateLogin,
  validateRequestReset,
  validateResetPassword,
  registerSchema,
  loginSchema,
  requestResetSchema,
  resetPasswordSchema
};
