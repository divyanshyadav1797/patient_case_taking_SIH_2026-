const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  console.error(err.stack);
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
