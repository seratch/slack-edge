import { SlackOAuthEnv } from "../app-env";
import { Authorize } from "../authorization/authorize";
import { Installation } from "./installation";

export interface InstallationStoreQuery {
  enterpriseId?: string;
  teamId?: string;
  userId?: string;
  isEnterpriseInstall?: boolean;
}

export interface InstallationStore<E extends SlackOAuthEnv> {
  save(installation: Installation, request: Request | undefined): Promise<void>;

  findBotInstallation(
    query: InstallationStoreQuery
  ): Promise<Installation | undefined>;

  findUserInstallation(
    query: InstallationStoreQuery
  ): Promise<Installation | undefined>;

  toAuthorize(): Authorize<E>;
}
