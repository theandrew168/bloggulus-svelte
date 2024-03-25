/**
 * Sentinel error used to rollback transactions and skip committing the changes.
 * Should only be used for rolling back transactions during integration tests.
 */
export class RollbackError extends Error {}
