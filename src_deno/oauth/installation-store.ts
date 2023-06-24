import { SlackOAuthEnv } from "../app-env.ts";
import { Authorize } from "../authorization/authorize.ts";
import { Installation } from "./installation.ts";

export interface InstallationStoreQuery {
  enterpriseId?: string;
  teamId?: string;
  userId?: string;
  isEnterpriseInstall?: boolean;
}

export interface InstallationStore<E extends SlackOAuthEnv> {
  save(installation: Installation, request: Request | undefined): Promise<void>;

  findBotInstallation(
    query: InstallationStoreQuery,
  ): Promise<Installation | undefined>;

  findUserInstallation(
    query: InstallationStoreQuery,
  ): Promise<Installation | undefined>;

  toAuthorize(): Authorize<E>;
}
