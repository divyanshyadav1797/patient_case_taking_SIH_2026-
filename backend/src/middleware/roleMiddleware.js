const { errorResponse } = require('../utils/responseFormatter');

/**
 * Role authorization middleware
 * @param  {...string} allowedRoles - e.g. 'patient', 'doctor', 'hospital', 'kiosk', 'admin'
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized: User authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Role '${req.user.role}' is not authorized for this resource. Required: [${allowedRoles.join(', ')}]`,
        403
      );
    }

    next();
  };
}

module.exports = {
  authorizeRoles
};
