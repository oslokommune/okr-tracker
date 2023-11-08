import { matchedData, validationResult } from 'express-validator';

const validateRules = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    req.matchedData = matchedData(req);
    return next();
  }

  return res.status(400).json({
    message: 'Invalid request data',
    errors: errors.mapped(),
  });
};

export default validateRules;
