# Architecture

This project is a web application written in [TypeScript](https://www.typescriptlang.org/) + [SvelteKit](https://svelte.dev/docs/kit/introduction).
All of the critical application code / business logic lives in the `src/lib/server` directory (this is a SvelteKit convention).
Overall, the project tries to embrace the good parts of DDD (domain-driven design: clear group and encapsulation of domain concepts) and CQRS (command query request segregation: clear separation of "reading" vs "writing").

## Structure

Below is an outline of the application directory structure that exists under `src/lib/server`.

- `/` - The main domain models live here. As much as possible, business logic should "pushed down" into the relevant domain models.
- `/command` - This is where all application "commands" (in the CQRS sense) live. Anything that causes the application to change state is represented as a command. Commands "depend on abstractions": namely the `Repository` pattern for loading / storing domain models.
- `/repository` - Provides a decoupled layer for loading and storing the application domain models. Under the hood, a PostgreSQL database is used for persisting data.
- `/query` - Contains separate directories for each unique user interface (web, API, mobile, etc). These are separate because different UIs tend to show different shapes and quantities of data. This way, each set of queries can fetch only the necessary data needed to power their user interface.
