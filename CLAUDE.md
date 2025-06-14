# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Development Commands

### Web Development

```bash
# Start development server with file watching
deno task astro:dev

# Build the application
deno task astro:build

# Preview production build
deno task astro:preview

# Lint, format, and type check
deno task astro:check
```

### Data Management

```bash
# Download content from Internet Archive (requires AGILEDATA env var)
AGILEDATA=/path/to/store deno task tool:download

# Dump processed data to JSON file
AGILEDATA=/path/to/store deno task tool:dump-file data.json
```

### Testing

```bash
# Run all tests
deno test

# Run specific test file
deno test repositories/content/persistent.test.ts

# Run tests with coverage
deno test --coverage
```

## Architecture Overview

This is an **Astro framework** application that archives and serves blog content
from Internet Archive's Wayback Machine. The architecture follows **Clean
Architecture principles** with clear separation of concerns.

### Core Architecture Layers

**Models** (`models/`): Zod-based validation schemas for `Content` and `TimeMap`
entities with runtime type safety.

**Services** (`services/`): Business logic layer including:

- `WaybackMachineService`: HTTP client for Internet Archive API
- `ContentProcessor`: Content sanitization and processing
- Loader pattern implementations with fallback chains

**Repositories** (`repositories/`): Data access abstraction using Repository
pattern with interface-based design for both Content and TimeMap entities.

**Infrastructure** (`infra/storage/`): Key-Value Store abstraction with multiple
implementations:

- `DenoKvKeyValueStore`: Deno's native KV store
- `FileSystemKeyValueStore`: File-based storage
- `InMemoryKeyValueStore`: Memory-based storage for testing

### Data Flow Pattern

```
Internet Archive API → WaybackMachineService → ContentLoader → Repository → KV Store
                                          ↓
Astro Pages ← ContentProvider ← FallbackContentLoader (with graceful fallback)
```

### Key Design Patterns

- **Dependency Injection**: Services depend on interfaces, not concrete
  implementations
- **Fallback Chain**: Multiple loaders with graceful degradation when primary
  sources fail
- **Repository Pattern**: Abstracted data access with pluggable storage backends
- **Strategy Pattern**: Different loading strategies (repository, wayback,
  fallback)

## Development Guidelines

### TypeScript & Deno

- Use strict TypeScript with explicit types; avoid `any`
- Follow ES modules syntax with version-pinned imports
- Use Deno's standard library when possible
- Include proper permissions in commands
- Use `Deno.test()` for unit testing

### Testing Conventions

- Use Korean language for test descriptions (e.g., "get()은 KeyValueStore에서
  Content를 가져와야 합니다.")
- Do not use `spy` in test code
- Use `@std/assert` for assertions
- Test with `InMemoryKeyValueStore` for isolation

### Error Handling

- Implement retry logic for external API calls
- Use graceful fallbacks when primary data sources fail
- Handle gateway timeouts for Internet Archive API
- Use Zod for runtime validation with proper error messages

### Storage Strategy

The application uses a hybrid approach:

- **Primary source**: Internet Archive Wayback Machine
- **Local caching**: Key-value store for performance
- **Static data**: Pre-processed content in `data.json`
- **Multiple fallbacks**: Alternative archive versions when primary fails

## Project Context

This is a Korean-language blog archive service that displays content from
"애자일 이야기" (Agile Story) blog archived on Internet Archive. The
application:

- Fetches content from Wayback Machine
- Processes and sanitizes archived HTML
- Provides search functionality
- Serves content with proper attribution to original authors
- Uses AGPL-3.0 license for code (content rights belong to original authors)
