# Architecture

This project is a web application written in [TypeScript](https://www.typescriptlang.org/) + [SvelteKit](https://svelte.dev/docs/kit/introduction).
All of the critical application code / business logic lives in the `src/lib/server` directory (this is a SvelteKit convention).
Overall, the project tries to embrace the good parts of DDD (domain-driven design: clear grouping and encapsulation of domain concepts) and CQRS (command query responsibility segregation: clear separation of "reading" vs "writing").

## Structure

Below is an outline of the application directory structure that exists under `src/lib/server`.

- `/` - The main domain models live here. As much as possible, business logic should "pushed down" into the relevant domain models.
- `/command` - This is where all application "commands" (in the CQRS sense) live. Anything that causes the application to change state is represented as a command. Commands "depend on abstractions": namely the `Repository` pattern for loading / storing domain models.
- `/repository` - Provides a decoupled layer for loading and storing the application domain models. Under the hood, a PostgreSQL database is used for persisting data.
- `/query` - Contains separate directories for each unique user interface (web, API, mobile, etc). These are separate because different UIs tend to show different shapes and quantities of data. This way, each set of queries can fetch only the necessary data needed to power their user interface.

## Domain-Driven Design

### Domain Models

Domain models are implemented as classes with private internal state.
Any inspection or modification of a model's state is done through "getters" and "setters" (or equivalent `get` and `set` properties if the language supports it).
This way, enforcement of domain logic / business rules can occur whenever a model is modified.
The system should never be allowed to represent an invalid state and this starts at the very bottom with the core domain models.
The goal is to make it "difficult to get things wrong" which is in opposition to many other codebases where it is "difficult to get things right".

### Domain Services

This codebase doesn't actually make an explicit separation between "domain services" (operations that change the state of multiple domain models) and "application services" (process that load domain models from storage, update their state, and store them back atomically).

### Application Services

In this codebase, application services are implemented as CQRS "commands".
They are essentially synonymous.
More information about commands can be found in the CQRS section.

## Command Query Responsibility Segregation

### Commands

Commands are how the state of the system changes.
In fact, they are the _only_ way that the system's state can change.
Any operation that causes a mutation of the system (and its persisted state) will always be a implemented as a command.
By enforcing this, the application becomes decoupled from any specific user interface (web UI, REST API, etc).

As a general rule, commands only mutate the system: they don't return any data back to the caller (except in very specific circumstances).
Commands also tend to be "resource-based" and concern themselves with the modification of a small number of domain models at a time.
"Small number" here refers to the different model types themselves and not their actual instance quantities.

Commands typically follow a structure of:

1. Load some domain models from persistent storage using the `Repository` pattern
2. Validate the operation and make any necessary changes to the models
3. Store the models back to persistent stroage using the `Repository` pattern once more

### Queries

Queries are read-only operations that fetch information to render individual user interfaces.
Different user interfaces tend to have different data requirements (shape, quantity, access, etc) so keeping them grouped by UI (web, mobile, API, etc) allows for greater design flexibility.
Queries tend to be "page-based" or "screen-based" and often find themselves loading information from a bunch of different underlying models at once.

Importantly, queries do _not_ use the `Repository` pattern to load and aggregate the data needed to power a page.
Instead, they obtain data directly via whatever strategy best fits the situation.
This could range from writing raw SQL queries to cached in-memory stores to eventually-consistent "change data capture".
Queries have much more flexibility in _how_ they access the data because read-only operations are inherently safer and less complex than mutations.
To put things another way: getting "reads" wrong is less dangerous than getting "writes" wrong.
