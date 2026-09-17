// Centralized Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for developer debugging
  console.error('API Error:', err.message || err);

  // Mongoose invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    return res.status(404).json({
      status: 'error',
      message: 'Resource not found with invalid ID format'
    });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      status: 'error',
      message: `A record with this ${field} already exists.`
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json({
      status: 'error',
      message
    });
  }

  res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
