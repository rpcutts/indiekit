class ServerError extends Error {
  constructor(name = 'Server error', status = 500, ...args) {
    super(...args);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServerError);
    }

    this.name = name;
    this.status = status;
    if (args[1]) {
      this.uri = args[1];
    }
  }
}

module.exports = ServerError;
