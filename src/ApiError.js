class ApiError extends Error {
  constructor(statusCode = 500, message, errorCause = null) {
    super(message || errorCause.message);
    this.statusCode = statusCode;
    if (errorCause) {
      this.stack += '\nCaused by: '+errorCause.stack;
    }
  }
}

export default ApiError;
