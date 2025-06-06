import type { Repository } from "../repository/repository";

export async function deleteExpiredSessions(repo: Repository, now: Date): Promise<void> {
	await repo.asUnitOfWork(async (uow) => {
		const expiredSessions = await uow.session.listExpired(now);
		await Promise.all(expiredSessions.map((session) => uow.session.delete(session)));
	});
}

export async function signIn(repo: Repository, username: string): Promise<string> {
	let sessionID: string | undefined;
	await repo.asUnitOfWork(async (uow) => {
		// TODO: How do I catch just the "not found" error?
		const account = await uow.account.readByUsername(username);
	});

	return "wow";
}
