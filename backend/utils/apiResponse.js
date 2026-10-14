/**
 * Standardized API Response Helper for Krushak API
 */

const sendResponse = (res, statusCode, payload) => {
  return res.status(statusCode).json({
    success: true,
    ...payload,
  });
};

const sendSuccess = (res, data = {}, message = "Success", statusCode = 200) => {
  return sendResponse(res, statusCode, {
    message,
    ...(typeof data === "object" && !Array.isArray(data) ? data : { data }),
  });
};

const sendCreated = (res, data = {}, message = "Resource created successfully") => {
  return sendResponse(res, 201, {
    message,
    ...(typeof data === "object" && !Array.isArray(data) ? data : { data }),
  });
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendCreated,
};
