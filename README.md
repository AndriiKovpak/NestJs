# nestjs-project-structure

Node.js framework NestJS project structure

## Configuration

1. Create a `.env` file
    - Rename the [.env.sample](.env.sample) file to `.env` to fix it.
2. Edit env config
    - Edit the file in the [config](src/config) folder.
    - `default`, `development`, `production`, `test`

## Installation

```sh
# 1. node_modules
npm ci
# 1-1. npm < v7 or Node.js <= v14
npm i
# 2. When synchronize database from existing entities
npm run entity:sync
# 2-1. When import entities from an existing database
npm run entity:load
```

If you use multiple databases in `entity:load`, [modify them.](bin/entity.ts#L45)

## Development

```sh
npm run start:dev
# https://docs.nestjs.com/recipes/repl
npm run start:repl
```

Run [http://localhost:3000](http://localhost:3000)

## Test

```sh
npm test # exclude e2e
npm run test:e2e
```

## Production

```sh
npm run lint
npm run build
# define environment variable yourself.
# NODE_ENV=production PORT=8000 NO_COLOR=true node dist/app
node dist/app
# OR
npm start
```
