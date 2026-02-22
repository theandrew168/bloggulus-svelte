import { readFileSync, statSync } from "node:fs";

import TOML from "@iarna/toml";

export class MissingConfigError extends Error {
	constructor(name: string) {
		super(`Missing configuration: ${name}`);
		this.name = "MissingConfigError";
	}
}

export class InvalidConfigError extends Error {
	constructor(name: string, value: unknown) {
		super(`Invalid configuration: ${name} = ${value}`);
		this.name = "InvalidConfigError";
	}
}

function parseString(value: unknown): value is string {
	return typeof value === "string";
}

function parseBoolean(value: unknown): value is boolean {
	return typeof value === "boolean";
}

export type OAuthConfig = {
	clientID: string;
	clientSecret: string;
	redirectURI: string;
};

export class Config {
	private static _instance?: Config;

	readonly secretKey: string;
	readonly databaseURI: string;
	readonly enableDebugAuth: boolean;

	readonly githubOAuth?: OAuthConfig;
	readonly googleOAuth?: OAuthConfig;

	constructor(toml: string) {
		const obj = TOML.parse(toml);

		const secretKey = obj["secretKey"];
		if (secretKey === undefined) {
			throw new MissingConfigError("secretKey");
		}
		if (!parseString(secretKey)) {
			throw new InvalidConfigError("secretKey", secretKey);
		}
		this.secretKey = secretKey;

		const databaseURI = obj["databaseURI"];
		if (databaseURI === undefined) {
			throw new MissingConfigError("databaseURI");
		}
		if (!parseString(databaseURI)) {
			throw new InvalidConfigError("databaseURI", databaseURI);
		}
		this.databaseURI = databaseURI;

		const enableDebugAuth = obj["enableDebugAuth"];
		if (enableDebugAuth !== undefined) {
			if (!parseBoolean(enableDebugAuth)) {
				throw new InvalidConfigError("enableDebugAuth", enableDebugAuth);
			}
			this.enableDebugAuth = enableDebugAuth;
		} else {
			this.enableDebugAuth = false;
		}

		const githubClientID = obj["githubClientID"];
		if (githubClientID !== undefined && !parseString(githubClientID)) {
			throw new InvalidConfigError("githubClientID", githubClientID);
		}

		const githubClientSecret = obj["githubClientSecret"];
		if (githubClientSecret !== undefined && !parseString(githubClientSecret)) {
			throw new InvalidConfigError("githubClientSecret", githubClientSecret);
		}

		const githubRedirectURI = obj["githubRedirectURI"];
		if (githubRedirectURI !== undefined && !parseString(githubRedirectURI)) {
			throw new InvalidConfigError("githubRedirectURI", githubRedirectURI);
		}

		if (githubClientID && githubClientSecret && githubRedirectURI) {
			this.githubOAuth = {
				clientID: githubClientID,
				clientSecret: githubClientSecret,
				redirectURI: githubRedirectURI,
			};
		}

		const googleClientID = obj["googleClientID"];
		if (googleClientID !== undefined && !parseString(googleClientID)) {
			throw new InvalidConfigError("googleClientID", googleClientID);
		}

		const googleClientSecret = obj["googleClientSecret"];
		if (googleClientSecret !== undefined && !parseString(googleClientSecret)) {
			throw new InvalidConfigError("googleClientSecret", googleClientSecret);
		}

		const googleRedirectURI = obj["googleRedirectURI"];
		if (googleRedirectURI !== undefined && !parseString(googleRedirectURI)) {
			throw new InvalidConfigError("googleRedirectURI", googleRedirectURI);
		}

		if (googleClientID && googleClientSecret && googleRedirectURI) {
			this.googleOAuth = {
				clientID: googleClientID,
				clientSecret: googleClientSecret,
				redirectURI: googleRedirectURI,
			};
		}
	}

	static getInstance(): Config {
		if (!this._instance) {
			let fallbackPath = "bloggulus.conf";
			if (statSync("bloggulus.local.conf", { throwIfNoEntry: false })) {
				fallbackPath = "bloggulus.local.conf";
			}
			if (process.env["NODE_ENV"] === "test") {
				fallbackPath = "bloggulus.test.conf";
			}

			const path = process.env["BLOGGULUS_CONF"] ?? fallbackPath;
			const body = readFileSync(path, "utf-8");

			this._instance = new Config(body);
		}

		return this._instance;
	}
}
