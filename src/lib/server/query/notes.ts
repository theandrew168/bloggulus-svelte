// What is the dep graph between: repository, query, and command?
// command -> repo is fine
// command -> query is fine
// query -> conn is fine
// query -> repo is NOT fine
// query -> command is NOT fine

// NOTE: Non-pojo's cannot be serialized with SvelteKit. This gives me even more reason
// to believe that queries should be very frontend-specific. For example, it might make
// sense to have different queries for a web frontend vs a mobile frontend vs a REST API.

// Dates can be serialized by SvelteKit but URLs cannot.
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types

// How should these be organized / grouped? By page (index)? By type (article)?
// There should still be some sort of implementation hiding, though. So whatever
// these groupings are, they'll likely accept a Connection in their constructor.

// Why by page? No question about where / how to slice it. Naming is easy?
// Why not by page? Pages change. The same data could be used on multiple pages.
// Also, not all queries even come from pages. Sometimes commands need them: sync / session.
// Note, sync and session _could_ just use the repo (via list methods), but not every
// loaded blog / post requires changing: only certain ones will.

// Why by type? Easier to reason about the data itself. Easier to reuse across pages.
// Why not by type? Without page context, the type names and data itself can be confusing.

// Under the namespace "web", we have:
// article
// blog
// blog details (includes posts)
// post details
// account

// But for a different UI, these types might mean something else or contain different data.

// /
//   article
//     recent
//     recent for account
//     relevant
//     relevant for account
// /blogs
//   blog with follow status
//     list blogs
// /blogs/:id (admin)
//   blog details
//     read blog details
// /blogs/:id/posts/:id (admin)
//   post details
//     read post details
// /accounts (admin)
//   accout details
//     list accounts

// SYNC
//   basic blog (id and feed URL)
//     list basic blogs
//   basic post (id, url, title, published, hasContent)
//     list basic posts (for blog ID)
// SESSION
//   basic session (just id for expired sessions)
//     list expired basic sessions (for delete)

// One thing about SYNC and SESSION, though, is that their behavior is part of the
// domain (because they ultimately result in mutations). So, maybe I _should_ just
// implement "list" methods on the repository?

// Maybe each "feature" can be its own subdir? That way, the types can all have "simple"
// names that rely on the namespace. Since "blog" has diff data in "web" vs "sync", for example.
// Why not just YOLO Postgres queries? I don't want to leak that abstraction in case the impl
// ever changes. Could be a redis cache, could be a (mat) view, could be a different database (cdc).
//
// Something like (query/<feature>/<type>.ts):
// query/web/article.ts
// query/sync/blog.ts
// query/sync/post.ts
// query/session/session.ts
