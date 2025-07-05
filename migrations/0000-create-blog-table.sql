CREATE TABLE blog (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	feed_url TEXT NOT NULL UNIQUE,
	site_url TEXT NOT NULL,
	title TEXT NOT NULL,
	synced_at TIMESTAMPTZ NOT NULL,
	etag TEXT,
	last_modified TEXT,
	meta_created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	meta_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	meta_version INTEGER NOT NULL DEFAULT 1
);
