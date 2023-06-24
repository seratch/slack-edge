import { SlackAppEnv } from "../app-env.ts";
import { PreAuthorizeSlackMiddlwareRequest } from "../request/request.ts";
import { AuthorizeResult } from "./authorize-result.ts";

export type Authorize<E extends SlackAppEnv = SlackAppEnv> = (
  req: PreAuthorizeSlackMiddlwareRequest<E>,
) => Promise<AuthorizeResult>;
