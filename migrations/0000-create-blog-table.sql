CREATE TABLE blog (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	feed_url TEXT NOT NULL UNIQUE,
	site_url TEXT NOT NULL,
	title TEXT NOT NULL,
	etag TEXT,
	last_modified TEXT,
	synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
