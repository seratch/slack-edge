import { SlackAppEnv } from "../app-env.ts";
import { AuthorizeError } from "../errors.ts";
import { PreAuthorizeSlackMiddlewareRequest } from "../request/request.ts";

export interface AuthorizeErrorHandlerArgs<E extends SlackAppEnv> {
  request: PreAuthorizeSlackMiddlewareRequest<E>;
  error: AuthorizeError;
}

/**
 * The function that handles an error thrown by authorize function. If this function returns a Response instead of the thrown exception, the App immediately returns the response and skip executing all the following middleware and listeners.
 */
export type AuthorizeErrorHandler<E extends SlackAppEnv = SlackAppEnv> = (
  args: AuthorizeErrorHandlerArgs<E>,
) => Promise<Response | AuthorizeError>;

export function buildDefaultAuthorizeErrorHanlder<
  E extends SlackAppEnv,
>(): AuthorizeErrorHandler<E> {
  // deno-lint-ignore require-await
  return async ({ error }) => {
    return error;
  };
}
