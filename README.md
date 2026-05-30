# nxa-labs

An Nx Angular monorepo for learning and experimenting with Angular in a monorepo setup.

## Projects

### Apps

| Name | Path | Description |
|---|---|---|
| `memory-game` | `apps/memory-game` | Angular standalone app |

### Libraries

| Name | Import path | Path |
|---|---|---|
| `nxa-lab-ui` | `@nx-angular-labs/nxa-lab-ui` | `libs/nxa-lab-ui` |

## Project structure

```
├── apps/
│   └── memory-game/        - Angular standalone app with routing
├── libs/
│   └── nxa-lab-ui/         - Shared Angular UI component library
├── nx.json                 - Nx configuration
├── tsconfig.base.json      - TypeScript base configuration
└── eslint.config.mjs       - ESLint configuration
```

## Commands

```bash
# Serve the app
npx nx serve memory-game

# Build
npx nx build memory-game

# Test
npx nx test memory-game
npx nx test nxa-lab-ui

# Lint
npx nx lint memory-game
npx nx lint nxa-lab-ui

# Run all tests
npx nx run-many -t test

# Visualize project graph
npx nx graph
```

## Generating code

```bash
# New Angular app
npx nx g @nx/angular:application --name=my-app --directory=apps/my-app

# New Angular library
npx nx g @nx/angular:library --name=my-lib --directory=libs/my-lib

# New component
npx nx g @nx/angular:component --name=my-component --project=my-lib
```
