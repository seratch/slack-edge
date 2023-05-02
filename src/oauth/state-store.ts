export interface StateStore {
  issueNewState(): Promise<string>;
  consume(state: string): Promise<boolean>;
}

export class NoStorageStateStore implements StateStore {
  async issueNewState(): Promise<string> {
    return crypto.randomUUID();
  }

  async consume(state: string): Promise<boolean> {
    return true;
  }
}
