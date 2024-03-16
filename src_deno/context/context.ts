import { AuthorizeResult } from "../authorization/authorize-result.ts";
import {
  ChatPostMessageRequest,
  ChatPostMessageResponse,
  SlackAPIClient,
  WebhookParams,
} from "https://deno.land/x/slack_web_api_client@0.8.2/mod.ts";

export interface PreAuthorizeSlackAppContext {
  isEnterpriseinstall?: boolean;
  enterpriseId?: string;
  teamId?: string;
  userId?: string;
  actorEnterpriseId?: string;
  actorTeamId?: string;
  actorUserId?: string;
  botId?: string; // this will always exist when initializing SlackAppContext
  botUserId?: string; // this will always exist when initializing SlackAppContext
  responseUrl?: string;
  channelId?: string;
  triggerId?: string;
  functionExecutionId?: string;
  functionBotAccessToken?: string;
  custom: {
    // deno-lint-ignore no-explicit-any
    [key: string]: any; // custom properties
  };
}

export type Respond = (params: WebhookParams) => Promise<Response>;

export type SlackAppContext = {
  client: SlackAPIClient;
  botToken: string;
  botId: string; // this must exist here
  botUserId: string; // this must exist here
  userToken?: string;
  authorizeResult: AuthorizeResult;
} & PreAuthorizeSlackAppContext;

export type SlackAppContextWithChannelId = {
  channelId: string;
  say: (
    params: Omit<ChatPostMessageRequest, "channel">,
  ) => Promise<ChatPostMessageResponse>;
} & SlackAppContext;

export type SlackAppContextWithRespond = {
  channelId: string;
  respond: Respond;
} & SlackAppContext;

export type SlackAppContextWithOptionalRespond = {
  respond?: Respond;
} & SlackAppContext;

export function builtBaseContext(
  // deno-lint-ignore no-explicit-any
  body: Record<string, any>,
): PreAuthorizeSlackAppContext {
  return {
    isEnterpriseinstall: extractIsEnterpriseInstall(body),
    enterpriseId: extractEnterpriseId(body),
    teamId: extractTeamId(body),
    userId: extractUserId(body),
    actorEnterpriseId: extractActorEnterpriseId(body),
    actorTeamId: extractActorTeamId(body),
    actorUserId: extractActorUserId(body),
    botId: undefined, // will be set later
    botUserId: undefined, // will be set later
    responseUrl: extractResponseUrl(body),
    channelId: extractChannelId(body),
    triggerId: extractTriggerId(body),
    functionExecutionId: extractFunctionExecutionId(body),
    functionBotAccessToken: extractFunctionBotAccessToken(body),
    custom: {},
  };
}

export function extractIsEnterpriseInstall(
  // deno-lint-ignore no-explicit-any
  body: Record<string, any>,
): boolean | undefined {
  if (body.authorizations && body.authorizations.length > 0) {
    return body.authorizations[0].is_enterprise_install;
  } else if (body.is_enterprise_install) {
    if (typeof body.is_enterprise_install === "string") {
      // slash command payloads
      return body.is_enterprise_install === "true";
    }
    return body.is_enterprise_install == true;
  }
  return undefined;
}

export function extractEnterpriseId(
  // deno-lint-ignore no-explicit-any
  body: Record<string, any>,
): string | undefined {
  if (body.enterprise) {
    if (typeof body.enterprise === "string") {
      return body.enterprise;
    } else if (typeof body.enterprise === "object" && body.enterprise.id) {
      return body.enterprise.id;
    }
  } else if (body.authorizations && body.authorizations.length > 0) {
    return extractEnterpriseId(body.authorizations[0]);
  } else if (body.enterprise_id) {
    return body.enterprise_id;
  } else if (
    body.team &&
    typeof body.team === "object" &&
    body.team.enterprise_id
  ) {
    return body.team.enterprise_id;
  } else if (body.event) {
    return extractEnterpriseId(body.event);
  }
  return undefined;
}

// deno-lint-ignore no-explicit-any
export function extractTeamId(body: Record<string, any>): string | undefined {
  if (body.view && body.view.app_installed_team_id) {
    // view_submission payloads can have `view.app_installed_team_id`
    // when a modal view that was opened in a different workspace via some operations inside a Slack Connect channel.
    // Note that the same for enterprise_id does not exist. When you need to know the enterprise_id as well,
    // you have to run some query toward your InstallationStore to know the org where the team_id belongs to.
    return body.view.app_installed_team_id;
  } else if (body.team) {
    // With org-wide installations, payload.team in interactivity payloads can be None
    // You need to extract either payload.user.team_id or payload.view.team_id as below
    if (typeof body.team === "string") {
      return body.team;
    } else if (body.team.id) {
      return body.team.id;
    }
  } else if (body.authorizations && body.authorizations.length > 0) {
    // To make Events API handling functioning also for shared channels,
    // we should use .authorizations[0].team_id over .team_id
    return extractTeamId(body.authorizations[0]);
  } else if (body.team_id) {
    return body.team_id;
  } else if (body.user && typeof body.user === "object") {
    return body.user.team_id;
  } else if (body.view && typeof body.view === "object") {
    return body.view.team_id;
  }
  return undefined;
}

// deno-lint-ignore no-explicit-any
export function extractUserId(body: Record<string, any>): string | undefined {
  if (body.user) {
    if (typeof body.user === "string") {
      return body.user;
    }
    if (typeof body.user === "object" && body.user.id) {
      return body.user.id;
    }
  } else if (body.user_id) {
    return body.user_id;
  } else if (body.event) {
    return extractUserId(body.event);
  } else if (body.message) {
    return extractUserId(body.message);
  } else if (body.previous_message) {
    return extractUserId(body.previous_message);
  }
  return undefined;
}

export function extractActorEnterpriseId(
  // deno-lint-ignore no-explicit-any
  body: Record<string, any>,
): string | undefined {
  if (body.is_ext_shared_channel) {
    if (body.type === "event_callback") {
      const eventTeamId = body.event?.user_team || body.event?.team;
      if (eventTeamId && eventTeamId.startsWith("E")) {
        return eventTeamId;
      } else if (eventTeamId === body.team_id) {
        return body.enterprise_id;
      }
    }
  }
  return extractEnterpriseId(body);
}

export function extractActorTeamId(
  // deno-lint-ignore no-explicit-any
  body: Record<string, any>,
): string | undefined {
  if (body.is_ext_shared_channel) {
    if (body.type === "event_callback") {
      const eventType = body.event.type;
      if (eventType === "app_mention") {
        // The $.event.user_team can be an enterprise_id in app_mention events.
        // In the scenario, there is no way to retrieve actor_team_id as of March 2023
        const userTeam = body.event.user_team;
        if (!userTeam) {
          // working with an app installed in this user's org/workspace side
          return body.event.team;
        } else if (userTeam.startsWith("T")) {
          // interacting from a connected non-grid workspace
          return userTeam;
        }
        // Interacting from a connected grid workspace; in this case, team_id cannot be resolved as of March 2023
        return undefined;
      }
      const eventUserTeam = body.event.user_team;
      if (eventUserTeam) {
        if (eventUserTeam.startsWith("T")) {
          return eventUserTeam;
        } else if (eventUserTeam.startsWith("E")) {
          if (eventUserTeam === body.enterprise_id) {
            return body.team_id;
          } else if (eventUserTeam === body.context_enterprise_id) {
            return body.context_team_id;
          }
        }
      }
      const eventTeam = body.event.team;
      if (eventTeam) {
        if (eventTeam.startsWith("T")) {
          return eventTeam;
        } else if (eventTeam.startsWith("E")) {
          if (eventTeam === body.enterprise_id) {
            return body.team_id;
          } else if (eventTeam === body.context_enterprise_id) {
            return body.context_team_id;
          }
        }
      }
    }
  }
  return extractTeamId(body);
}

export function extractActorUserId(
  // deno-lint-ignore no-explicit-any
  body: Record<string, any>,
): string | undefined {
  if (body.is_ext_shared_channel) {
    if (body.type === "event_callback") {
      if (body.event) {
        if (extractActorEnterpriseId(body) && extractActorTeamId(body)) {
          // When both enterprise_id and team_id are not identified, we skip returning user_id too for safety
          return undefined;
        }
        return body.event.user || body.event.user_id;
      } else {
        return undefined;
      }
    }
  }
  return extractUserId(body);
}

export function extractResponseUrl(
  // deno-lint-ignore no-explicit-any
  body: Record<string, any>,
): string | undefined {
  if (body.response_url) {
    return body.response_url;
  } else if (body.response_urls && body.response_urls.length > 0) {
    return body.response_urls[0].response_url;
  }
  return undefined;
}

export function extractChannelId(
  // deno-lint-ignore no-explicit-any
  body: Record<string, any>,
): string | undefined {
  if (body.channel) {
    if (typeof body.channel === "string") {
      return body.channel;
    } else if (typeof body.channel === "object" && body.channel.id) {
      return body.channel.id;
    }
  } else if (body.channel_id) {
    return body.channel_id;
  } else if (body.event) {
    return extractChannelId(body.event);
  } else if (body.item) {
    // reaction_added: body["event"]["item"]
    return extractChannelId(body.item);
  }
  return undefined;
}

export function extractTriggerId(
  // deno-lint-ignore no-explicit-any
  body: Record<string, any>,
): string | undefined {
  if (body.trigger_id) {
    return body.trigger_id;
  }
  if (body.interactivity) {
    return body.interactivity.interactivity_pointer;
  }
  return undefined;
}

export function extractFunctionExecutionId(
  // deno-lint-ignore no-explicit-any
  body: Record<string, any>,
): string | undefined {
  if (body.event) {
    return extractFunctionExecutionId(body.event);
  }
  if (body.function_execution_id) {
    return body.function_execution_id;
  }
  if (body.function_data) {
    return body.function_data.execution_id;
  }
  return undefined;
}

export function extractFunctionBotAccessToken(
  // deno-lint-ignore no-explicit-any
  body: Record<string, any>,
): string | undefined {
  if (body.event) {
    return extractFunctionBotAccessToken(body.event);
  }
  if (body.bot_access_token) {
    return body.bot_access_token;
  }
  return undefined;
}
