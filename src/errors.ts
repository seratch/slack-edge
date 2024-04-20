/**
 * Exception that occurred during the configuration of the app.
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

/**
 * Exception that occurred during an authorize() call.
 */
export class AuthorizeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizeError";
  }
}

/**
 * Exception that occurred during the configuration of Socket Mode.
 */
export class SocketModeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SocketModeError";
  }
}
