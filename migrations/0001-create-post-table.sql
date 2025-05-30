CREATE TABLE post (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	blog_id uuid NOT NULL REFERENCES blog(id) ON DELETE CASCADE,
	url TEXT NOT NULL UNIQUE,
	title TEXT NOT NULL,
	content TEXT,
	published_at TIMESTAMPTZ NOT NULL,
	fts_data TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || content)) STORED,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX post_blog_id_idx ON post(blog_id);
CREATE INDEX post_fts_data_idx ON post USING GIN(fts_data);
