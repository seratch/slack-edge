export interface StateStore {
  issueNewState(): Promise<string>;
  consume(state: string): Promise<boolean>;
}

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
