/**
 * An interface representing context parameter in Cloudflare Workers and Vercel Edge Functions.
 * Refer to the following resources:
 * - https://developers.cloudflare.com/workers/runtime-apis/fetch-event/
 * - https://vercel.com/docs/concepts/functions/edge-functions/edge-functions-api#waituntil
 */
export interface ExecutionContext {
  // deno-lint-ignore no-explicit-any
  waitUntil(promise: Promise<any>): void;
}

/**
 * Default ExecutionContext with simple settings.
 */
export class NoopExecutionContext implements ExecutionContext {
  // deno-lint-ignore no-explicit-any
  waitUntil(promise: Promise<any>): void {
    promise.catch((reason) => {
      console.error(`Failed to run a lazy listener: ${reason}`);
    });
  }
}
