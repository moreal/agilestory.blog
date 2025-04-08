# Note

## Install Ollama

```
brew install ollama
```

```
ollama pull bge-m3
```

## Setup database

```
docker compose up
```

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydatabase" deno task db:drizzle-kit migrate
```

## Setup data

```
AGILEDATA=/path/to/store deno task tool:download
AGILEDATA=/path/to/store DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydatabase" deno task tool:dump-db
```

## Start frontend

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydatabase"  deno task web:start
```
