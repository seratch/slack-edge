export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export class AuthorizeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizeError";
  }
}

export class ResponseUrlError extends Error {
  constructor(status: number, body: string) {
    const message = `Failed to send a message using response_url (status: ${status}, body: ${body})`;
    super(message);
    this.name = "ResponseUrlError";
  }
}
