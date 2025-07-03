CREATE TABLE session (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	account_id UUID NOT NULL REFERENCES account(id) ON DELETE CASCADE,
	token_hash TEXT NOT NULL UNIQUE,
	expires_at TIMESTAMPTZ NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	update_version INTEGER NOT NULL DEFAULT 1
);

-- Used when querying for expired sessions.
CREATE INDEX session_expires_at_idx ON session(expires_at);