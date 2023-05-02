import { ExecutionContext } from "./execution-context";
import { SlackApp } from "./app";
import { SlackOAuthEnv } from "./app-env";
import { InstallationStore } from "./oauth/installation-store";
import { NoStorageStateStore, StateStore } from "./oauth/state-store";
import {
  renderCompletionPage,
  renderStartPage,
} from "./oauth/oauth-page-renderer";
import { generateAuthorizeUrl } from "./oauth/authorize-url-generator";
import { parse as parseCookie } from "cookie";
import {
  SlackAPIClient,
  OAuthV2AccessResponse,
  OpenIDConnectTokenResponse,
} from "slack-web-api-client";
import { toInstallation } from "./oauth/installation";
import {
  AfterInstallation,
  BeforeInstallation,
  OnFailure,
  OnStateValidationError,
  defaultOnFailure,
  defaultOnStateValidationError,
} from "./oauth/callback";
import {
  OpenIDConnectCallback,
  defaultOpenIDConnectCallback,
} from "./oidc/callback";
import { generateOIDCAuthorizeUrl } from "./oidc/authorize-url-generator";
import {
  InstallationError,
  MissingCode,
  CompletionPageError,
  InstallationStoreError,
  OpenIDConnectError,
} from "./oauth/error-codes";

export interface SlackOAuthAppOptions<E extends SlackOAuthEnv> {
  env: E;
  installationStore: InstallationStore<E>;
  stateStore?: StateStore;
  oauth?: {
    stateCookieName?: string;
    beforeInstallation?: BeforeInstallation;
    afterInstallation?: AfterInstallation;
    onFailure?: OnFailure;
    onStateValidationError?: OnStateValidationError;
    redirectUri?: string;
  };
  oidc?: {
    stateCookieName?: string;
    callback: OpenIDConnectCallback;
    onFailure?: OnFailure;
    onStateValidationError?: OnStateValidationError;
    redirectUri?: string;
  };
  routes?: {
    events: string;
    oauth: { start: string; callback: string };
    oidc?: { start: string; callback: string };
  };
}

export class SlackOAuthApp<E extends SlackOAuthEnv> extends SlackApp<E> {
  public env: E;
  public installationStore: InstallationStore<E>;
  public stateStore: StateStore;
  public oauth: {
    stateCookieName?: string;
    beforeInstallation?: BeforeInstallation;
    afterInstallation?: AfterInstallation;
    onFailure: OnFailure;
    onStateValidationError: OnStateValidationError;
    redirectUri?: string;
  };
  public oidc?: {
    stateCookieName?: string;
    callback: OpenIDConnectCallback;
    onFailure: OnFailure;
    onStateValidationError: OnStateValidationError;
    redirectUri?: string;
  };
  public routes: {
    events: string;
    oauth: { start: string; callback: string };
    oidc?: { start: string; callback: string };
  };

  constructor(options: SlackOAuthAppOptions<E>) {
    super({
      env: options.env,
      authorize: options.installationStore.toAuthorize(),
      routes: { events: options.routes?.events ?? "/slack/events" },
    });
    this.env = options.env;
    this.installationStore = options.installationStore;
    this.stateStore = options.stateStore ?? new NoStorageStateStore();
    this.oauth = {
      stateCookieName:
        options.oauth?.stateCookieName ?? "slack-app-oauth-state",
      onFailure: options.oauth?.onFailure ?? defaultOnFailure,
      onStateValidationError:
        options.oauth?.onStateValidationError ?? defaultOnStateValidationError,
      redirectUri: options.oauth?.redirectUri ?? this.env.SLACK_REDIRECT_URI,
    };
    if (options.oidc) {
      this.oidc = {
        stateCookieName: options.oidc.stateCookieName ?? "slack-app-oidc-state",
        onFailure: options.oidc.onFailure ?? defaultOnFailure,
        onStateValidationError:
          options.oidc.onStateValidationError ?? defaultOnStateValidationError,
        callback: defaultOpenIDConnectCallback(this.env),
        redirectUri:
          options.oidc.redirectUri ?? this.env.SLACK_OIDC_REDIRECT_URI,
      };
    } else {
      this.oidc = undefined;
    }
    this.routes = options.routes
      ? options.routes
      : {
          events: "/slack/events",
          oauth: {
            start: "/slack/install",
            callback: "/slack/oauth_redirect",
          },
          oidc: {
            start: "/slack/login",
            callback: "/slack/login/callback",
          },
        };
  }

  async run(request: Request, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET") {
      if (url.pathname === this.routes.oauth.start) {
        return await this.handleOAuthStartRequest(request);
      } else if (url.pathname === this.routes.oauth.callback) {
        return await this.handleOAuthCallbackRequest(request);
      }
      if (this.routes.oidc) {
        if (url.pathname === this.routes.oidc.start) {
          return await this.handleOIDCStartRequest(request);
        } else if (url.pathname === this.routes.oidc.callback) {
          return await this.handleOIDCCallbackRequest(request);
        }
      }
    } else if (request.method === "POST") {
      if (url.pathname === this.routes.events) {
        return await this.handleEventRequest(request, ctx);
      }
    }
    return new Response("Not found", { status: 404 });
  }

  async handleEventRequest(
    request: Request,
    ctx: ExecutionContext
  ): Promise<Response> {
    return await super.handleEventRequest(request, ctx);
  }

  async handleOAuthStartRequest(request: Request): Promise<Response> {
    const stateValue = await this.stateStore.issueNewState();
    const authorizeUrl = generateAuthorizeUrl(stateValue, this.env);
    return new Response(renderStartPage(authorizeUrl), {
      status: 302,
      headers: {
        Location: authorizeUrl,
        "Set-Cookie": `${this.oauth.stateCookieName}=${stateValue}; Secure; HttpOnly; Path=/; Max-Age=300`,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  async handleOAuthCallbackRequest(request: Request): Promise<Response> {
    // State parameter validation
    await this.#validateStateParameter(
      request,
      this.routes.oauth.start,
      this.oauth.stateCookieName!
    );

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) {
      return await this.oauth.onFailure(
        this.routes.oauth.start,
        MissingCode,
        request
      );
    }

    const client = new SlackAPIClient(undefined, {
      logLevel: this.env.SLACK_LOGGING_LEVEL,
    });
    let oauthAccess: OAuthV2AccessResponse | undefined;
    try {
      // Execute the installation process
      oauthAccess = await client.oauth.v2.access({
        client_id: this.env.SLACK_CLIENT_ID,
        client_secret: this.env.SLACK_CLIENT_SECRET,
        redirect_uri: this.oauth.redirectUri,
        code,
      });
    } catch (e) {
      console.log(e);
      return await this.oauth.onFailure(
        this.routes.oauth.start,
        InstallationError,
        request
      );
    }

    try {
      // Store the installation data on this app side
      await this.installationStore.save(toInstallation(oauthAccess), request);
    } catch (e) {
      console.log(e);
      return await this.oauth.onFailure(
        this.routes.oauth.start,
        InstallationStoreError,
        request
      );
    }

    try {
      // Build the completion page
      const authTest = await client.auth.test({
        token: oauthAccess.access_token,
      });
      const enterpriseUrl = authTest.url;
      return new Response(
        renderCompletionPage(
          oauthAccess.app_id!,
          oauthAccess.team?.id!,
          oauthAccess.is_enterprise_install,
          enterpriseUrl
        ),
        {
          status: 200,
          headers: {
            "Set-Cookie": `${this.oauth.stateCookieName}=deleted; Secure; HttpOnly; Path=/; Max-Age=0`,
            "Content-Type": "text/html; charset=utf-8",
          },
        }
      );
    } catch (e) {
      console.log(e);
      return await this.oauth.onFailure(
        this.routes.oauth.start,
        CompletionPageError,
        request
      );
    }
  }

  async handleOIDCStartRequest(request: Request): Promise<Response> {
    if (!this.oidc) {
      return new Response("Not found", { status: 404 });
    }
    const stateValue = await this.stateStore.issueNewState();
    const authorizeUrl = generateOIDCAuthorizeUrl(stateValue, this.env);
    return new Response(renderStartPage(authorizeUrl), {
      status: 302,
      headers: {
        Location: authorizeUrl,
        "Set-Cookie": `${this.oidc.stateCookieName}=${stateValue}; Secure; HttpOnly; Path=/; Max-Age=300`,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  async handleOIDCCallbackRequest(request: Request): Promise<Response> {
    if (!this.oidc || !this.routes.oidc) {
      return new Response("Not found", { status: 404 });
    }
    // State parameter validation
    await this.#validateStateParameter(
      request,
      this.routes.oidc.start,
      this.oidc.stateCookieName!
    );

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) {
      return await this.oidc.onFailure(
        this.routes.oidc.start,
        MissingCode,
        request
      );
    }

    try {
      const client = new SlackAPIClient(undefined, {
        logLevel: this.env.SLACK_LOGGING_LEVEL,
      });
      const apiResponse: OpenIDConnectTokenResponse =
        await client.openid.connect.token({
          client_id: this.env.SLACK_CLIENT_ID,
          client_secret: this.env.SLACK_CLIENT_SECRET,
          redirect_uri: this.oidc.redirectUri,
          code,
        });
      return await this.oidc.callback(apiResponse, request);
    } catch (e) {
      console.log(e);
      return await this.oidc.onFailure(
        this.routes.oidc.start,
        OpenIDConnectError,
        request
      );
    }
  }

  async #validateStateParameter(
    request: Request,
    startPath: string,
    cookieName: string
  ) {
    const { searchParams } = new URL(request.url);
    const queryState = searchParams.get("state");
    const cookie = parseCookie(request.headers.get("Cookie") || "");
    const cookieState = cookie[cookieName];
    if (queryState !== cookieState) {
      if (startPath === this.routes.oauth.start) {
        return await this.oauth.onStateValidationError(startPath, request);
      } else if (
        this.oidc &&
        this.routes.oidc &&
        startPath === this.routes.oidc.start
      ) {
        return await this.oidc.onStateValidationError(startPath, request);
      }
    }
  }
}
