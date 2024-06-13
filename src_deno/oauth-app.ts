import { ExecutionContext, NoopExecutionContext } from "./execution-context.ts";
import { SlackApp } from "./app.ts";
import { SlackOAuthEnv } from "./app-env.ts";
import { InstallationStore } from "./oauth/installation-store.ts";
import { NoStorageStateStore, StateStore } from "./oauth/state-store.ts";
import { generateAuthorizeUrl } from "./oauth/authorize-url-generator.ts";
import { parse as parseCookie } from "./cookie.ts";
import {
  OAuthV2AccessResponse,
  OpenIDConnectTokenResponse,
  SlackAPIClient,
} from "https://deno.land/x/slack_web_api_client@0.12.0/mod.ts";
import { toInstallation } from "./oauth/installation.ts";
import {
  AfterInstallation,
  BeforeInstallation,
  defaultOAuthCallback,
  defaultOAuthStart,
  defaultOnFailure,
  defaultOnStateValidationError,
  OAuthCallback,
  OAuthStart,
  OnFailure,
  OnStateValidationError,
} from "./oauth/hook.ts";
import {
  defaultOpenIDConnectCallback,
  OpenIDConnectCallback,
} from "./oidc/hook.ts";
import { generateOIDCAuthorizeUrl } from "./oidc/authorize-url-generator.ts";
import {
  CompletionPageError,
  InstallationError,
  InstallationStoreError,
  MissingCode,
  OpenIDConnectError,
} from "./oauth/error-codes.ts";
import {
  OAuthCompletionPageRenderer,
  OAuthErrorPageRenderer,
  OAuthStartPageRenderer,
} from "./oauth/oauth-page-renderer.ts";

/**
 * Options for initializing SlackOAuthApp instance.
 */
export interface SlackOAuthAppOptions<E extends SlackOAuthEnv> {
  /**
   * Passed env variables for configuring the app.
   */
  env: E;

  /**
   * InstallationStore for managing installation data such as issued OAUth tokens.
   */
  installationStore: InstallationStore<E>;

  /**
   * Server-side store for managing the state parameter string used for general OAuth security.
   * When this is absent, the OAuth flow uses only web browser cookies to ensure security.
   */
  stateStore?: StateStore;

  /**
   * Settings for app-installation OAuth flow.
   */
  oauth?: {
    stateCookieName?: string;
    beforeInstallation?: BeforeInstallation;
    afterInstallation?: AfterInstallation;
    onFailure?: OnFailure;
    onFailureRenderer?: OAuthErrorPageRenderer;
    onStateValidationError?: OnStateValidationError;
    onStateValidationRenderer?: OAuthErrorPageRenderer;
    redirectUri?: string;
    start?: OAuthStart;
    startImmediateRedirect?: boolean; // default: true
    startRenderer?: OAuthStartPageRenderer;
    callback?: OAuthCallback;
    callbackRenderer?: OAuthCompletionPageRenderer;
  };

  /**
   * Settings for Sign in with Slack (SIWS / OpenID Connect)
   *
   * @see https://api.slack.com/authentication/sign-in-with-slack
   */
  oidc?: {
    stateCookieName?: string;
    start?: OAuthStart;
    startImmediateRedirect?: boolean; // default: true
    startRenderer?: OAuthStartPageRenderer;
    // We intentionally don't provide callbackRenderer
    // because your app will need to handle the whole response to make it meaningful
    callback: OpenIDConnectCallback;
    onFailure?: OnFailure;
    onFailureRenderer?: OAuthErrorPageRenderer;
    onStateValidationError?: OnStateValidationError;
    onStateValidationRenderer?: OAuthErrorPageRenderer;
    redirectUri?: string;
  };

  /**
   * The endpoint routes to handle requests from Slack's API server.
   * When this app connects to Slack through Socket Mode, this setting won't be used.
   */
  routes?: {
    // The name "events" could be somewhat confusing, but this path handles all types of request patterns
    events: string;
    oauth: { start: string; callback: string };
    oidc?: { start: string; callback: string };
  };
}

/**
 * The class representing a Slack app process
 * that handles both event requests and the OAuth flow for app installation.
 */
export class SlackOAuthApp<E extends SlackOAuthEnv> extends SlackApp<E> {
  /**
   * Passed env variables for configuring the app.
   */
  public env: E;

  /**
   * InstallationStore for managing installation data such as issued OAUth tokens.
   */
  public installationStore: InstallationStore<E>;

  /**
   * Server-side store for managing the state parameter string used for general OAuth security.
   * When this is absent, the OAuth flow uses only web browser cookies to ensure security.
   */
  public stateStore: StateStore;

  /**
   * Settings for app-installation OAuth flow.
   */
  public oauth: {
    stateCookieName?: string;
    beforeInstallation?: BeforeInstallation;
    afterInstallation?: AfterInstallation;
    onFailure: OnFailure;
    onStateValidationError: OnStateValidationError;
    redirectUri?: string;
    start: OAuthStart;
    callback: OAuthCallback;
  };

  /**
   * Settings for Sign in with Slack (SIWS / OpenID Connect)
   *
   * @see https://api.slack.com/authentication/sign-in-with-slack
   */
  public oidc?: {
    stateCookieName?: string;
    start: OAuthStart;
    callback: OpenIDConnectCallback;
    onFailure: OnFailure;
    onStateValidationError: OnStateValidationError;
    redirectUri?: string;
  };

  /**
   * The endpoint routes to handle requests from Slack's API server.
   * When this app connects to Slack through Socket Mode, this setting won't be used.
   */
  public routes: {
    // The name "events" could be somewhat confusing, but this path handles all types of request patterns
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
      stateCookieName: options.oauth?.stateCookieName ??
        "slack-app-oauth-state",
      onFailure: options.oauth?.onFailure ??
        defaultOnFailure(options.oauth?.onFailureRenderer),
      onStateValidationError: options.oauth?.onStateValidationError ??
        defaultOnStateValidationError(options.oauth?.onStateValidationRenderer),
      redirectUri: options.oauth?.redirectUri ?? this.env.SLACK_REDIRECT_URI,
      start: options.oauth?.start ??
        defaultOAuthStart(
          options.oauth?.startImmediateRedirect,
          options.oauth?.startRenderer,
        ),
      beforeInstallation: options.oauth?.beforeInstallation,
      afterInstallation: options.oauth?.afterInstallation,
      callback: options.oauth?.callback ??
        defaultOAuthCallback(options.oauth?.callbackRenderer),
    };
    if (options.oidc) {
      this.oidc = {
        stateCookieName: options.oidc.stateCookieName ?? "slack-app-oidc-state",
        onFailure: options.oidc.onFailure ??
          defaultOnFailure(options.oidc?.onFailureRenderer),
        onStateValidationError: options.oidc.onStateValidationError ??
          defaultOnStateValidationError(
            options.oidc?.onStateValidationRenderer,
          ),
        start: options.oidc?.start ??
          defaultOAuthStart(
            options.oidc?.startImmediateRedirect,
            options.oidc?.startRenderer,
          ),
        callback: options.oidc.callback ?? defaultOpenIDConnectCallback,
        redirectUri: options.oidc.redirectUri ??
          this.env.SLACK_OIDC_REDIRECT_URI,
      };
    } else {
      this.oidc = undefined;
    }
    this.routes = options.routes ? options.routes : {
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

  async run(
    request: Request,
    ctx: ExecutionContext = new NoopExecutionContext(),
  ): Promise<Response> {
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

  /**
   * Handles an HTTP request from Slack's API server and returns a response to it.
   * @param request request
   * @param ctx execution context
   * @returns response
   */
  async handleEventRequest(
    request: Request,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return await super.handleEventRequest(request, ctx);
  }

  /**
   * Handles an HTTP request to initiate the app-installation OAuth flow within a web browser.
   * @param request request
   * @returns response
   */
  async handleOAuthStartRequest(request: Request): Promise<Response> {
    const stateValue = await this.stateStore.issueNewState();
    const authorizeUrl = generateAuthorizeUrl(stateValue, this.env);
    return await this.oauth.start({
      env: this.env,
      authorizeUrl,
      stateCookieName: this.oauth.stateCookieName!,
      stateValue,
      request,
    });
  }

  /**
   * Handles an HTTP request to handle the app-installation OAuth flow callback within a web browser.
   * @param request request
   * @returns response
   */
  async handleOAuthCallbackRequest(request: Request): Promise<Response> {
    // State parameter validation
    const errorResponse = await this.#validateStateParameter(
      request,
      this.routes.oauth.start,
      this.oauth.stateCookieName!,
    );
    if (errorResponse) {
      return errorResponse;
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) {
      return await this.oauth.onFailure({
        env: this.env,
        startPath: this.routes.oauth.start,
        reason: MissingCode,
        request,
      });
    }

    if (this.oauth.beforeInstallation) {
      const response = await this.oauth.beforeInstallation({
        env: this.env,
        request,
      });
      if (response) {
        return response;
      }
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
      return await this.oauth.onFailure({
        env: this.env,
        startPath: this.routes.oauth.start,
        reason: InstallationError,
        request,
      });
    }
    const installation = toInstallation(oauthAccess);
    if (this.oauth.afterInstallation) {
      const response = await this.oauth.afterInstallation({
        env: this.env,
        request,
        installation,
      });
      if (response) {
        return response;
      }
    }

    try {
      // Store the installation data on this app side
      await this.installationStore.save(installation, request);
    } catch (e) {
      console.log(e);
      return await this.oauth.onFailure({
        env: this.env,
        startPath: this.routes.oauth.start,
        reason: InstallationStoreError,
        request,
      });
    }

    try {
      // Build the completion page
      const authTest = await client.auth.test({
        token: oauthAccess.access_token,
      });
      const enterpriseUrl = authTest.url;
      return await this.oauth.callback({
        env: this.env,
        oauthAccess,
        enterpriseUrl,
        stateCookieName: this.oauth.stateCookieName!,
        request,
      });
    } catch (e) {
      console.log(e);
      return await this.oauth.onFailure({
        env: this.env,
        startPath: this.routes.oauth.start,
        reason: CompletionPageError,
        request,
      });
    }
  }

  /**
   * Handles an HTTP request to initiate the SIWS flow within a web browser.
   * @param request request
   * @returns response
   */
  async handleOIDCStartRequest(request: Request): Promise<Response> {
    if (!this.oidc) {
      return new Response("Not found", { status: 404 });
    }
    const stateValue = await this.stateStore.issueNewState();
    const authorizeUrl = generateOIDCAuthorizeUrl(stateValue, this.env);
    return await this.oauth.start({
      env: this.env,
      authorizeUrl,
      stateCookieName: this.oidc.stateCookieName!,
      stateValue,
      request,
    });
  }

  /**
   * Handles an HTTP request to handle the SIWS callback within a web browser.
   * @param request request
   * @returns response
   */
  async handleOIDCCallbackRequest(request: Request): Promise<Response> {
    if (!this.oidc || !this.routes.oidc) {
      return new Response("Not found", { status: 404 });
    }
    // State parameter validation
    const errorResponse = await this.#validateStateParameter(
      request,
      this.routes.oidc.start,
      this.oidc.stateCookieName!,
    );
    if (errorResponse) {
      return errorResponse;
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) {
      return await this.oidc.onFailure({
        env: this.env,
        startPath: this.routes.oidc.start,
        reason: MissingCode,
        request,
      });
    }

    try {
      const client = new SlackAPIClient(undefined, {
        logLevel: this.env.SLACK_LOGGING_LEVEL,
      });
      const token: OpenIDConnectTokenResponse = await client.openid.connect
        .token({
          client_id: this.env.SLACK_CLIENT_ID,
          client_secret: this.env.SLACK_CLIENT_SECRET,
          redirect_uri: this.oidc.redirectUri,
          code,
        });
      return await this.oidc.callback({
        env: this.env,
        token,
        request,
      });
    } catch (e) {
      console.log(e);
      return await this.oidc.onFailure({
        env: this.env,
        startPath: this.routes.oidc.start,
        reason: OpenIDConnectError,
        request,
      });
    }
  }

  async #validateStateParameter(
    request: Request,
    startPath: string,
    cookieName: string,
  ): Promise<Response | undefined> {
    const { searchParams } = new URL(request.url);
    const queryState = searchParams.get("state");
    const cookie = parseCookie(request.headers.get("Cookie") || "");
    const cookieState = cookie[cookieName];
    if (
      queryState !== cookieState ||
      !(await this.stateStore.consume(queryState))
    ) {
      if (startPath === this.routes.oauth.start) {
        return await this.oauth.onStateValidationError({
          env: this.env,
          startPath,
          request,
        });
      } else if (
        this.oidc &&
        this.routes.oidc &&
        startPath === this.routes.oidc.start
      ) {
        return await this.oidc.onStateValidationError({
          env: this.env,
          startPath,
          request,
        });
      }
    }
    return undefined;
  }
}
