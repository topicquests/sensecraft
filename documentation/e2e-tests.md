# End-to-End Tests

## How to Run

All commands are run from the `sc-client/` directory.

### Prerequisites

The backend server must be running before executing tests. The `test:playwright:full` scripts handle this automatically; the `test:playwright` scripts assume the server is already up.

### Scripts

| Script | Description |
|--------|-------------|
| `npm run test:playwright` | Run all Playwright e2e tests against an already-running server |
| `npm run test:playwright:ui` | Same as above but opens the Playwright interactive UI |
| `npm run test:playwright:full` | Build and start the server, then run all tests |
| `npm run test:playwright:full:ui` | Build and start the server, then open the Playwright UI |

### What each script does

**`test:playwright`**
```
playwright install && playwright test --config src/playwright.config.ts -j1
```
- Installs browser binaries if missing
- Runs all tests sequentially (`-j1` = 1 worker, required because tests share database state)
- Expects the backend to already be running on port 3000
- The config starts a Quasar dev server on port 9090 for the frontend

**`test:playwright:full`**
```
npm run --prefix ../server build &&
npm run --prefix ../server test_playwright &
wait-on tcp:localhost:3000 -t 60000 &&
playwright install &&
playwright test --config src/playwright.config.ts -j1
```
- Builds the server
- Starts the server's test environment in the background (PostgREST, auth, etc.)
- Waits up to 60 seconds for port 3000 to become available
- Then runs the tests

### Config (`src/playwright.config.ts`)

- **Test directory**: `src/tests/e2e/`
- **Base URL**: `http://localhost:9090`
- **Browser**: Chromium, headless
- **Web server**: Starts `quasar dev --port 9090` automatically before tests
- **Workers**: 1 (tests must run in order — they share a test database)

---

## Test Process

The tests run in filename order (01 through 20) and simulate a complete quest lifecycle from user registration through quest completion. **Each test builds on the database state left by the previous one** — they cannot be run in isolation.

### Phase 1 — Setup (01–06)

| File | What it does |
|------|-------------|
| `01-register.spec.ts` | Registers all users: admin, questCreator, guildCreator1, guildCreator2, players 1–10 |
| `02-signin.spec.ts` | Verifies each user can sign in |
| `03-admin.spec.ts` | Admin confirms all user email addresses |
| `04-create-quest.spec.ts` | questCreator creates the quest with a root conversation node |
| `05-edit-quest.spec.ts` | questCreator edits the root node (type, status) and sets quest to registration |
| `06-create-guild.spec.ts` | guildCreator1 creates "Black Knights"; guildCreator2 creates "Coherence" (Saggezza) |

### Phase 2 — Guild Setup (07–13)

| File | What it does |
|------|-------------|
| `07-join-guild-1.spec.ts` | Players 1–5 join Black Knights |
| `08-guild-conversations.spec.ts` | Guild channel conversations |
| `09-join-guild-2.spec.ts` | Players 6–10 join Coherence |
| `10-guild1-admin-set-roles.spec.ts` | Guild 1 admin registers to quest, sets roles: guildCreator1 → Game leader, player1 → Philosopher, player2 → Critic, player3 → Researcher, player4 → Scribe |
| `11-guild2-admin-set-roles.spec.ts` | Same for Guild 2: guildCreator2 → Game leader, player6 → Philosopher, player7 → Critic, player8 → Researcher, player9 → Scribe, player10 → Researcher |
| `12-players-guild1-join-quest.spec.ts` | Players 1–5 register to the quest (selecting their role) |
| `13-players-guild2-join-quest.spec.ts` | Players 6–10 register to the quest |

### Phase 3 — Draft Conversations (14–16)

Guild members build conversation trees in `guild_draft` status. Nodes are visible to all members of the same guild but invisible to the other guild.

**Guild 1 tree** (`14-guild1-conversations.spec.ts`):
```
Root question
└── guildCreator1: question  "What systemic changes are needed to combat climate change?"
    ├── player1:   answer     (Philosopher — moral imperative)
    ├── player2:   con_answer (Critic — economic barriers)
    ├── player3:   reference  (Researcher — IPCC data)
    │   └── player5: question (Researcher — follow-up on NASA data)
    └── player4:   answer     (Scribe — consequences overview)
```

**Guild 2 tree** (`15-guild2-conversations.spec.ts`):
```
Root question
└── guildCreator2: question  "How can communities adapt to climate change impacts?"
    ├── player6:   answer     (Philosopher — environmental ethics)
    ├── player7:   con_answer (Critic — structural challenges)
    ├── player8:   reference  (Researcher — World Bank strategies)
    │   └── player10: question (Researcher — UNEP emissions gap)
    └── player9:   answer     (Scribe — adaptation synthesis)
```

| File | What it does |
|------|-------------|
| `16-complete-quest.spec.ts` | questCreator sets quest status to **ongoing** (enables submission) |

### Phase 4 — Submit and Publish (17–18)

Guild game leaders submit all `guild_draft` nodes to `submitted`. Because the quest is **continuous** (not turn-based), submitted nodes are automatically published and become visible to all players including the other guild.

| File | What it does |
|------|-------------|
| `17-guild1-submit.spec.ts` | guildCreator1 submits all 6 Guild 1 nodes |
| `18-guild2-submit.spec.ts` | guildCreator2 submits all 6 Guild 2 nodes |

### Phase 5 — Cross-Guild Responses (18a–18d)

After publication, each guild can see the other's nodes and respond. Response nodes are added as `guild_draft` and then submitted/published via the same continuous-quest flow.

**Guild 1 responds to Guild 2** (`18a-guild1-respond.spec.ts`):
```
guildCreator2's question
└── guildCreator1Response: question
    ├── player1Response:   answer
    ├── player2Response:   con_answer
    ├── player3Response:   con_answer
    ├── player4Response:   answer
    └── player5Response:   con_answer
```

**Guild 2 responds to Guild 1** (`18b-guild2-respond.spec.ts`):
```
guildCreator1's question
└── guildCreator2Response: question
    ├── player6Response:   answer
    ├── player7Response:   con_answer
    ├── player8Response:   con_answer
    ├── player9Response:   answer
    └── player10Response:  con_answer
```

| File | What it does |
|------|-------------|
| `18a-guild1-respond.spec.ts` | Guild 1 adds response nodes to Guild 2's published tree |
| `18b-guild2-respond.spec.ts` | Guild 2 adds response nodes to Guild 1's published tree |
| `18c-guild1-submit-responses.spec.ts` | guildCreator1 submits all Guild 1 response nodes |
| `18d-guild2-submit-responses.spec.ts` | guildCreator2 submits all Guild 2 response nodes |

### Phase 6 — Finish (19–20)

| File | What it does |
|------|-------------|
| `19-complete-quest.spec.ts` | questCreator sets quest status to **finished** |
| `20-rules.spec.ts` | Verifies scoring rules |

---

## Test Data

All test users, guilds, quests, and conversation content are defined in [`sc-client/src/tests/utilities/StoreMocks.ts`](../sc-client/src/tests/utilities/StoreMocks.ts).

| Mock | Value |
|------|-------|
| Quest | "Climate Change Consequences" (continuous, not turn-based) |
| Guild 1 | "Black Knights" |
| Guild 2 | "Coherence" (Saggezza) |
| Players 1–5 | Guild 1 members (Black Knights) |
| Players 6–10 | Guild 2 members (Coherence) |

### Node types used

| IBIS type | Used for |
|-----------|----------|
| `question` | Game leader nodes, cross-guild response roots |
| `answer` | Philosopher and Scribe nodes |
| `con_answer` | Critic nodes, cross-guild counter-responses |
| `reference` | Researcher nodes |

### Valid IBIS child types

| Parent type | Valid children |
|-------------|---------------|
| `question` / `quest` | `answer`, `con_answer`, `question`, `reference` |
| `answer` / `con_answer` | `question`, `answer`, `con_answer`, `con`, `pro`, `reference` |
| `reference` | `question`, `con`, `pro` |
| `channel` | `question`, `reference` |

---

## Common Issues

**Tests fail with "element not found" for a member on the admin page**
The join-guild tests (07, 09) wait up to 5 seconds for the Join button before checking. If a player is missing from the guild admin page, re-run from a clean test database. The most common cause is a previous partial run where the player's join was skipped before the page fully loaded.

**`Node added successfuly` typo**
The success notification contains a typo (`successfuly` with one `l`). The tests match this exact string intentionally.

**Tests must run sequentially**
The `-j1` flag is mandatory. Tests share a single PostgreSQL test database and each test depends on state created by previous tests. Running tests in parallel will cause failures.

**Strict mode violations on dropdowns**
The type and status selectors use `.q-menu` filtered by unique text (`'question'` for type menus, `'guild_draft'` for status menus) to avoid matching multiple simultaneously-open Quasar dropdown menus during CSS transitions.
