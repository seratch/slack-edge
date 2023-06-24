export interface AuthorizeResult {
  enterpriseId?: string;
  teamId?: string;
  team?: string;
  url?: string;
  botId: string;
  botUserId: string;
  botToken: string;
  botScopes: string[];
  userId?: string;
  user?: string;
  userToken?: string;
  userScopes?: string[];
}
