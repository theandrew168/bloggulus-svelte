import { Account } from "../account";
import type { Repository } from "../repository/repository";
import { generateToken, Session } from "../session";

export const SESSION_EXPIRY_HOURS = 7 * 24;
export const SESSION_EXPIRY_SECONDS = SESSION_EXPIRY_HOURS * 60 * 60;

export class AuthCommand {
	private _repo: Repository;

	constructor(repo: Repository) {
		this._repo = repo;
	}

	async signIn(username: string): Promise<string> {
		const token = generateToken();
		await this._repo.asUnitOfWork(async (uow) => {
			let account = await uow.account.readByUsername(username);
			if (!account) {
				account = new Account({ username });
				await uow.account.createOrUpdate(account);
			}

			const session = new Session({
				accountID: account.id,
				expiresAt: new Date(Date.now() + SESSION_EXPIRY_SECONDS * 1000),
			});
			await uow.session.createOrUpdate(session, token);
		});

		return token;
	}

	async signOut(token: string): Promise<void> {
		await this._repo.asUnitOfWork(async (uow) => {
			const session = await uow.session.readByToken(token);
			if (!session) {
				return;
			}

			await uow.session.delete(session);
		});
	}

	async deleteExpiredSessions(now: Date): Promise<void> {
		await this._repo.asUnitOfWork(async (uow) => {
			const expiredSessions = await uow.session.listExpired(now);
			await Promise.all(expiredSessions.map((session) => uow.session.delete(session)));
		});
	}
}
