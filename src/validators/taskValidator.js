const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().min(1).max(255).required().messages({
    'string.empty': 'Title cannot be empty',
    'string.max': 'Title must not exceed 255 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().allow(null, '').messages({
    'string.base': 'Description must be a string'
  }),
  status: Joi.string().valid('pending', 'in_progress', 'completed').default('pending').messages({
    'any.only': 'Status must be one of: pending, in_progress, completed'
  }),
  priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium').messages({
    'any.only': 'Priority must be one of: Low, Medium, High'
  }),
  due_date: Joi.date().allow(null, '').messages({
    'date.base': 'Due date must be a valid date'
  })
});

const validateTask = (data) => {
  return taskSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateTask,
  taskSchema
};
