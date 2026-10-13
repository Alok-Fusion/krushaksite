const validate = (schema) => (req, res, next) => {
  try {
    const dataToValidate = {};
    if (schema.shape.body) dataToValidate.body = req.body;
    if (schema.shape.query) dataToValidate.query = req.query;
    if (schema.shape.params) dataToValidate.params = req.params;

    const validated = schema.parse(dataToValidate);

    if (validated.body) req.body = validated.body;
    if (validated.query) req.query = validated.query;
    if (validated.params) req.params = validated.params;

    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.slice(1).join("."),
        message: err.message,
      }));
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${formattedErrors.map((e) => e.message).join(", ")}`,
        errors: formattedErrors,
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message || "Invalid request payload",
    });
  }
};

module.exports = validate;
