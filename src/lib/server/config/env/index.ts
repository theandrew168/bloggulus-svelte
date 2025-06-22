import type { Config, OAuthConfig } from "..";

const DEFAULT_SECRET_KEY = "DO_NOT_USE_IN_PRODUCTION";
const LOCAL_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";
const TEST_DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/postgres";

export class EnvConfig implements Config {
	private static _instance?: EnvConfig;

	readonly secretKey: string;
	readonly databaseURL: string;
	readonly enableDebugAuth: boolean;

	readonly githubOAuth?: OAuthConfig;
	readonly googleOAuth?: OAuthConfig;

	constructor() {
		this.secretKey = process.env.BLOGGULUS_SECRET_KEY || DEFAULT_SECRET_KEY;

		const isTest = process.env.NODE_ENV === "test";
		if (isTest) {
			this.databaseURL = TEST_DATABASE_URL;
		} else {
			this.databaseURL = process.env.BLOGGULUS_DATABASE_URL || LOCAL_DATABASE_URL;
		}

		const isDevelopment = process.env.NODE_ENV === "development";
		this.enableDebugAuth = isDevelopment || process.env.BLOGGULUS_ENABLE_DEBUG_AUTH === "true";

		const githubClientID = process.env.BLOGGULUS_GITHUB_CLIENT_ID;
		const githubClientSecret = process.env.BLOGGULUS_GITHUB_CLIENT_SECRET;
		const githubRedirectURI = process.env.BLOGGULUS_GITHUB_REDIRECT_URI;
		if (githubClientID && githubClientSecret && githubRedirectURI) {
			this.githubOAuth = {
				clientID: githubClientID,
				clientSecret: githubClientSecret,
				redirectURI: githubRedirectURI,
			};
		}

		const googleClientID = process.env.BLOGGULUS_GOOGLE_CLIENT_ID;
		const googleClientSecret = process.env.BLOGGULUS_GOOGLE_CLIENT_SECRET;
		const googleRedirectURI = process.env.BLOGGULUS_GOOGLE_REDIRECT_URI;
		if (googleClientID && googleClientSecret && googleRedirectURI) {
			this.googleOAuth = {
				clientID: googleClientID,
				clientSecret: googleClientSecret,
				redirectURI: googleRedirectURI,
			};
		}
	}

	static getInstance(): EnvConfig {
		if (!this._instance) {
			this._instance = new EnvConfig();
		}

		return this._instance;
	}
}
