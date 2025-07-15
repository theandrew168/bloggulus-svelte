export type OAuthConfig = {
	clientID: string;
	clientSecret: string;
	redirectURI: string;
};

export type Config = {
	secretKey: string;
	databaseURI: string;
	enableDebugAuth: boolean;

	githubOAuth?: OAuthConfig;
	googleOAuth?: OAuthConfig;
};
