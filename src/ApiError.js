class ApiError extends Error {
  statusCode: number;

  constructor(
    statusCode: number = 500, message: ?string,
    errorCause: ?{ stack: ?string, message: string } = null
  ) {
    super(message || (errorCause ? errorCause.message : null));
    this.statusCode = statusCode;
    if (errorCause && errorCause.stack) {
      this.stack += `\nCaused by: ${errorCause.stack}`;
    }
  }
}

export default ApiError;
