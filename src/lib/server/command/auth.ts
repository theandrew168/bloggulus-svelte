import { Account } from "../account";
import type { Repository } from "../repository/repository";
import { generateToken, Session } from "../session";

const SESSION_EXPIRY_HOURS = 7 * 24;
const SESSION_EXPIRY_MS = SESSION_EXPIRY_HOURS * 60 * 60 * 1000;

export async function signIn(repo: Repository, username: string): Promise<string> {
	const token = generateToken();
	await repo.asUnitOfWork(async (uow) => {
		let account = await uow.account.readByUsername(username);
		if (!account) {
			account = new Account({ username });
			await uow.account.createOrUpdate(account);
		}

		const session = new Session({
			accountID: account.id,
			expiresAt: new Date(Date.now() + SESSION_EXPIRY_MS),
		});
		await uow.session.createOrUpdate(session, token);
	});

	return token;
}

export async function signOut(repo: Repository, token: string): Promise<void> {
	await repo.asUnitOfWork(async (uow) => {
		const session = await uow.session.readByToken(token);
		if (!session) {
			return;
		}

		await uow.session.delete(session);
	});
}

export async function deleteExpiredSessions(repo: Repository, now: Date): Promise<void> {
	await repo.asUnitOfWork(async (uow) => {
		const expiredSessions = await uow.session.listExpired(now);
		await Promise.all(expiredSessions.map((session) => uow.session.delete(session)));
	});
}
