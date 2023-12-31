CREATE TABLE post (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    body TEXT,
    content_index TSVECTOR
        GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || body)) STORED,

    blog_id uuid NOT NULL REFERENCES blog(id) ON DELETE CASCADE
);

CREATE INDEX post_content_index_idx ON post USING GIN(content_index);
CREATE INDEX post_blog_id_idx ON post(blog_id);
