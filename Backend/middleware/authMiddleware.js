// TODO: JWT verification middleware
const authMiddleware = (req, res, next) => {
  // verify token here
  next();
};
module.exports = authMiddleware;
