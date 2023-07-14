import validator from 'express-validator';

const { body, header, param } = validator;

export const teamSecretValidator = header('okr-team-secret')
  .not()
  .isEmpty()
  .withMessage('The `okr-team-secret` header is required');

export const adminSecretValidator = header('okr-admin-secret')
  .not()
  .isEmpty()
  .withMessage('The `okr-admin-secret` header is required');

export const idValidator = param('id').trim().escape();

export const dateValidator = param('date')
  .trim()
  .isDate()
  .escape()
  .toDate()
  .custom((date) => {
    if (date.getTime() > new Date().getTime()) {
      throw new Error('Future dates not allowed');
    }
    return true;
  });

const checkMeasurementValue = (field) =>
  field
    .not()
    .isEmpty()
    .withMessage('Required field')
    .isFloat({ min: 0 })
    .escape()
    .toFloat();

export const progressValidator = checkMeasurementValue(body('progress'));
export const valueValidator = checkMeasurementValue(body('value'));

export const commentValidator = body('comment').trim().escape();

export const displayNameValidator = body('displayName').trim().escape();

export const positionValidator = body('position').trim().escape();
