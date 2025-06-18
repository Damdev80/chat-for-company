// src/validations/idea.validation.js - Validaciones simples para ideas
// Validaciones manuales sin express-validator por ahora

export const validateCreateIdea = (req, res, next) => {
  const { group_id, title, description, category, priority } = req.body;
  const errors = [];

  // Validar group_id
  if (!group_id || group_id.trim() === '') {
    errors.push('Group ID es requerido');
  }

  // Validar title
  if (!title || title.trim() === '') {
    errors.push('El título es requerido');
  } else if (title.trim().length < 3) {
    errors.push('El título debe tener al menos 3 caracteres');
  } else if (title.trim().length > 200) {
    errors.push('El título no puede tener más de 200 caracteres');
  }

  // Validar description (opcional)
  if (description && description.trim().length > 1000) {
    errors.push('La descripción no puede tener más de 1000 caracteres');
  }

  // Validar category (opcional)
  const validCategories = ['general', 'feature', 'improvement', 'bug', 'other'];
  if (category && !validCategories.includes(category)) {
    errors.push('Categoría inválida. Debe ser: ' + validCategories.join(', '));
  }

  // Validar priority (opcional)
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (priority && !validPriorities.includes(priority)) {
    errors.push('Prioridad inválida. Debe ser: ' + validPriorities.join(', '));
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors
    });
  }

  next();
};

export const validateUpdateIdea = (req, res, next) => {
  const { title, description, category, priority } = req.body;
  const errors = [];

  // Validar title (opcional en update)
  if (title !== undefined) {
    if (title.trim() === '') {
      errors.push('El título no puede estar vacío');
    } else if (title.trim().length < 3) {
      errors.push('El título debe tener al menos 3 caracteres');
    } else if (title.trim().length > 200) {
      errors.push('El título no puede tener más de 200 caracteres');
    }
  }

  // Validar description (opcional)
  if (description !== undefined && description.trim().length > 1000) {
    errors.push('La descripción no puede tener más de 1000 caracteres');
  }

  // Validar category (opcional)
  const validCategories = ['general', 'feature', 'improvement', 'bug', 'other'];
  if (category && !validCategories.includes(category)) {
    errors.push('Categoría inválida. Debe ser: ' + validCategories.join(', '));
  }

  // Validar priority (opcional)
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (priority && !validPriorities.includes(priority)) {
    errors.push('Prioridad inválida. Debe ser: ' + validPriorities.join(', '));
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors
    });
  }

  next();
};

export const validateVoteIdea = (req, res, next) => {
  const { vote_type } = req.body;
  const errors = [];

  if (!vote_type) {
    errors.push('Tipo de voto es requerido');
  } else if (!['up', 'down'].includes(vote_type)) {
    errors.push('Tipo de voto inválido. Debe ser "up" o "down"');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors
    });
  }

  next();
};
