const Joi = require('joi');

const baseSchema = {
  title: Joi.string().min(1).max(255).required().messages({
    'string.empty': 'Title cannot be empty',
    'string.max': 'Title must not exceed 255 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().allow(null, '').messages({
    'string.base': 'Description must be a string'
  }),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'overdue').default('pending').messages({
    'any.only': 'Status must be one of: pending, in_progress, completed, overdue'
  }),
  priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium').messages({
    'any.only': 'Priority must be one of: Low, Medium, High'
  }),
  category: Joi.string().valid('DVK Print Shop', 'TyDee Tasks', 'Personal').default('Personal').messages({
    'any.only': 'Category must be one of: DVK Print Shop, TyDee Tasks, Personal'
  }),
};

const createSchema = Joi.object({
  ...baseSchema,
  due_date: Joi.date().min('now').allow(null, '').messages({
    'date.base': 'Due date must be a valid date',
    'date.min': 'Due date cannot be in the past'
  })
});

const updateSchema = Joi.object({
  ...baseSchema,
  due_date: Joi.date().allow(null, '').messages({
    'date.base': 'Due date must be a valid date'
  })
});

const validateTask = (data) => createSchema.validate(data, { abortEarly: false });
const validateTaskUpdate = (data) => updateSchema.validate(data, { abortEarly: false });

module.exports = {
  validateTask,
  validateTaskUpdate,
  createSchema,
  updateSchema
};
