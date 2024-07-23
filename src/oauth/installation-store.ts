import { SlackOAuthEnv } from "../app-env";
import { Authorize } from "../authorization/authorize";
import { Installation } from "./installation";

/**
 * Query to find an installation.
 */
export interface InstallationStoreQuery {
  enterpriseId?: string;
  teamId?: string;
  userId?: string;
  isEnterpriseInstall?: boolean;
}

/**
 * InstallationStore representation.
 */
export interface InstallationStore<E extends SlackOAuthEnv> {
  /**
   * Saves an installation; this operations must be an upsert.
   * @param installation installation data
   * @param request request
   */
  save(installation: Installation, request: Request | undefined): Promise<void>;

  /**
   * Finds a bot scope installation from the datastore.
   * @param query query to find an installation
   */
  findBotInstallation(query: InstallationStoreQuery): Promise<Installation | undefined>;

  /**
   * Finds a user scope installation from the datastore.
   * @param query query to find an installation
   */
  findUserInstallation(query: InstallationStoreQuery): Promise<Installation | undefined>;

  /**
   * Deletes a bot scope installation in the datastore.
   * @param query query to find an installation
   */
  deleteBotInstallation(query: InstallationStoreQuery): Promise<void>;

  /**
   * Deletes a user scope installation in the datastore.
   * @param query query to find an installation
   */
  deleteUserInstallation(query: InstallationStoreQuery): Promise<void>;

  /**
   * Deletes all installations for the given org/team.
   * @param query query to find installations
   */
  deleteAll(query: InstallationStoreQuery): Promise<void>;

  /**
   * Returns an authorize() function utilizing this installation store.
   */
  toAuthorize(): Authorize<E>;
}
