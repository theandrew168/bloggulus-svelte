# bloggulus

Bloggulus is a web application for aggregating and indexing your favorite blogs.
I wrote it to serve as a less engaging and more personalized version of sites like Hacker News or Reddit.

## Local Development

While the primary [Bloggulus website](https://bloggulus.com) represents my own personal collection of blogs, it is designed to be easily self-hostable.

### Setup

This project depends on [NodeJS](https://nodejs.org/en) v22 (or higher).

On macOS, this dependency can be easily installed via [Homebrew](https://brew.sh/):

```
brew install node
```

### Database

This project uses [PostgreSQL](https://www.postgresql.org/) for persistent storage.
To develop locally, you'll an instance of the database running somehow or another.

### Containers

I find [Docker](https://www.docker.com/) to be a nice tool for this but you can do whatever works best.

The following command starts the necessary containers:

```bash
docker compose up -d
```

These containers can be stopped via:

```bash
docker compose down
```

### Running

First, install all project depenencies:

```bash
npm install
```

Then, apply any pending database migrations:

```bash
npm run migrate
```

Lastly, start the development server:

```bash
npm run dev
```

### Building

When building for production, SvelteKit's [adapter-node](https://svelte.dev/docs/kit/adapter-node) is used to compile the project into a NodeJS-ready directory.

```bash
npm run build
```

Then, to run the built / compiled version of the project locally, run `node` directly:

```
NODE_ENV=development ORIGIN=http://127.0.0.1:3000 node build
```
