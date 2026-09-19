/**
 * Send standard success JSON response
 */
function successResponse(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send standard error JSON response
 */
function errorResponse(res, message = 'An error occurred', statusCode = 400, errors = null) {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

module.exports = {
  successResponse,
  errorResponse,
  formatSuccess: successResponse,
  formatError: errorResponse
};
