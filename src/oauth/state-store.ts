/**
 * The server-side store for state parameter that is used for better OAuth security.
 */
export interface StateStore {
  /**
   * Issues a new state parameter string data.
   */
  issueNewState(): Promise<string>;

  /**
   * Consumes a passed state parameter and invalidate it to prevent further usage.
   * @param state state parameter data
   */
  consume(state: string): Promise<boolean>;
}

/**
 * The default state store implementation, which does not store the value in a datastore on the server-side.
 * With this implementation, slack-edge relies on web browser cookie data,
 * plus the state parameter data never expires.
 * For even better security, having a server-side datastore that manages expiration of state data is recommended.
 */
export class NoStorageStateStore implements StateStore {
  // deno-lint-ignore require-await
  async issueNewState(): Promise<string> {
    return crypto.randomUUID();
  }

  // deno-lint-ignore require-await no-unused-vars
  async consume(state: string): Promise<boolean> {
    return true;
  }
}
