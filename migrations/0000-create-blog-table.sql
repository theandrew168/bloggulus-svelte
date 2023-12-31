CREATE TABLE blog (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_url TEXT NOT NULL UNIQUE,
    site_url TEXT NOT NULL,
    title TEXT NOT NULL,
	etag TEXT,
	last_modified TEXT
);
