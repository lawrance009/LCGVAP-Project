/**
 * validate.js
 * ============================================================
 * Express middleware factory for Zod schema validation.
 *
 * Usage:
 *   router.post('/route', validate(mySchema), controller);
 *
 * Validates req.body against the provided Zod schema.
 * On failure → 400 with structured field errors (no crash).
 * On success → req.body is replaced with the parsed (cleaned)
 *              data so controllers always receive valid input.
 *
 * IMPORTANT: stripUnknown is enabled — any extra fields sent
 * by a client are silently removed before reaching controllers.
 * This prevents parameter pollution attacks.
 * ============================================================
 */

const { ZodError } = require('zod');

/**
 * @param {import('zod').ZodSchema} schema
 * @returns {import('express').RequestHandler}
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Format Zod errors into a clean, readable structure
    // Support Zod v4 (issues) or v3 (errors)
    const errorArray = result.error.issues || result.error.errors;
    const errors = errorArray.map((err) => ({
      field:   err.path.join('.') || 'body',
      message: err.message,
    }));

    return res.status(400).json({
      error:  'Validation failed',
      errors, // e.g. [{ field: "email", message: "Invalid email address" }]
    });
  }

  // Replace req.body with the clean, parsed, type-coerced data
  req.body = result.data;
  next();
};

module.exports = validate;
