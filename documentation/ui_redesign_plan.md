# SENSEcraft UI Redesign — Institutional Design System

Status: proposed, pending approval. Presentation-layer only — no route, store, or data-flow changes.

## Context

SENSEcraft (`sc-client`: Vue 3 + Quasar 2 + Pinia) needs to read as credible to three buyer types at once — educational institutions, private-sector businesses, and government/public-sector agencies — under procurement review and public-sector accessibility requirements. Today the UI has no design system: colors are hardcoded per component (`background-color: ivory`, `bg-deep-purple-7`, ad-hoc cyan/blue gradients), typography/spacing/radii/shadows vary file to file, the home page uses a stock photo of people, and the sign-out control is a plain text link. This plan replaces the visual layer wholesale — component library, page templates, navigation, layout system — while preserving every existing route, feature, and data flow.

Framework/tooling stays exactly as-is: Vue 3 `<script setup>`, Quasar 2 components, SCSS via `quasar.variables.scss` + `app.scss`. No new npm dependencies — Roboto and Material Icons are already bundled via Quasar's `extras` config, which is sufficient for an institutional look.

## Design Direction

**Aesthetic — "Structured Clarity":** calm neutral surfaces, one confident deep-blue accent, hairline borders over heavy drop-shadows, generous whitespace, abstract geometric node/graph motifs (echoing SENSEcraft's IBIS conversation-tree concept) instead of stock photography. No gradients except one restrained hero wash. Reads like GOV.UK/USWDS-adjacent enterprise software, not a consumer game.

**Palette** (all pairings checked for WCAG AA):

| Role | Value | Replaces |
|---|---|---|
| Primary | `#1E4A72` (deep navy-blue) | `deep-purple-7` / `#0f12da` |
| Secondary | `#4A5C6A` (slate blue-gray) | flat `#f5f5f5` |
| Accent | `#0F7B6C` (muted teal) — sparing use | — |
| Neutral ramp | `gray-50 #F7F8F9` → `gray-900 #1A1F23` (9 steps) | one-off grays/`ivory`/`#1e1e1e` |
| Success | `#1E7B45` | `#21ba45` |
| Warning | `#8A5A00` | `#f2c037` (too low-contrast on white) |
| Error | `#B3261E` | `#c10015` |
| Info | `#1768AC` | `#31ccec` |

**Typography:** Roboto only (already loaded, no new dependency). Modular scale — Display 2.5rem/700, H1 2rem/700, H2 1.5rem/600, H3 1.25rem/600, H4 1.125rem/600, Body 1rem/400, Small 0.875rem/400, Caption 0.75rem/400. Line-height 1.5 body / 1.25 headings. Drop italic subtitles (reads informal); use regular weight + muted gray-600 for secondary text.

**Iconography:** Material Icons only (already loaded, no new package). Sign-out uses the built-in `logout` glyph.

**Spacing / radii / elevation:** spacing aligns to Quasar's existing 4px-based `q-pa-*`/`q-gutter-*` scale (documented, not reinvented). Radii: `sm 4px` (inputs/chips), `md 8px` (buttons/cards), `lg 12px` (modals/drawers). Elevation flattens to a hairline border + soft shadow token for cards (replacing the overused `0 4px 10px rgba(0,0,0,.15)`), with a stronger shadow token reserved for dialogs/menus/drawers only.

**Imagery:** drop `democratic_leadership_style_discussed.jpg` (stock photo of people) and the cyan/purple hero gradient. Replace with an authored, license-clean inline-SVG abstract node/graph pattern (ties thematically to the conversation tree) used as a subtle backdrop on the home hero, sign-in/register pages, and empty states. Existing IBIS node-type icons (`statics/images/*_sm.png` — topic/issue/position/argument, etc.) are functional iconography for the conversation tree, not decoration — kept as-is, just restyled in their containing chrome.

## Token Layer (single source of truth)

- `sc-client/src/css/quasar.variables.scss` — replace `$primary/$secondary/$accent/$dark/$positive/$negative/$info/$warning` with the palette above.
- `sc-client/src/css/tokens.scss` **(new)** — CSS custom properties on `:root` for the full ramp, typography scale, spacing reference, radii, elevation/shadow levels, and a `focus-visible` outline token. This file's header comment is the documentation the mandate calls for — one place where tokens are defined and consumed from, so it can't drift out of sync with a separate doc.
- `sc-client/src/css/app.scss` — `@import 'tokens.scss'` first; base element styles (`h1`–`h6`, `body`, `a`, `:focus-visible`) driven by tokens, removing the current stray rules (e.g. `li { color: red }`).
- `sc-client/src/css/components.scss` **(new)**, imported from `app.scss` — centralized Quasar component re-theme: `.q-btn`, `.q-card`, `.q-field`/`.q-input`, `.q-table`, `.q-dialog`, `.q-banner`/toasts, `.q-chip`, `.q-tooltip`, `.q-pagination`, `.q-skeleton`, empty-state utility classes. Quasar already supplies accessible table/dialog/tabs/pagination/skeleton components; we retheme centrally and only touch a component's own `<style>` block where it currently hardcodes colors that fight the tokens.
- `quasar.config.js` — add `'components.scss'` to the existing `css:` array (same mechanism already used for `app.scss`; no new tooling). Also set global `Notify` defaults (position, token-driven colors/icons per type) once in `framework.config`, so every `$q.notify(...)` call site matches the system automatically.

## App Shell & Navigation

- `src/layouts/MainLayout.vue` — rebuild header/toolbar/footer on tokens; keep the existing mobile-breakpoint strategy, replace the values. **Sign-out**: replace the `label="log off"` text button with an icon-only `q-btn` (`icon="logout"`, `flat round`, `aria-label="Sign out"`, wrapped in `q-tooltip`), keeping `id="logoff"` / `name="logoffBtn"` unchanged so existing Playwright specs keep passing.
- `src/components/drawer_menu.vue` — restyle list/active/hover/focus states, add leading icons per nav item; keep every `:to`, `data-test`, and item text unchanged (a vitest spec asserts the mobile "logoff" item's text) — the icon-button requirement is scoped to the top bar only, per the mandate.
- `src/components/right-drawer.vue` — restyle the guild/quest conversation drawer to match tokens; keep the `name="rightdrawerBtn"` trigger untouched.
- `src/components/EssentialLink.vue` — audit and restyle if still referenced.
- `src/components/PageHeader.vue` **(new)** — title + optional subtitle + `q-breadcrumbs` + actions slot, used across list/detail pages (GuildList, QuestList, GuildPage, QuestPlayPage, AdminPage, etc.). Breadcrumb labels sourced from a small additive `meta.title` field on relevant routes in `src/router/routes.ts` — no path/name/component changes, so route behavior and existing route-based tests are unaffected.
- `src/components/EmptyState.vue` **(new)** — icon + heading + description + action slot, for "no quests yet" / "no guilds yet" / empty channel list states.

## Component Inventory Pass

Once tokens + `components.scss` exist, sweep every `.vue` file: strip hardcoded hex/gradients/fixed pixel sizes from `<style>` blocks, replace with token vars or existing Quasar utility classes. Same pattern repeats across the codebase — representative paths per group (not exhaustive):

- **Auth/onboarding**: `SignInPage.vue`, `RegisterPage.vue`, `ConfirmPassword.vue`, `ConfirmRegistration.vue`, `ResetPassword.vue`, `signin-card.vue`, `registration-form.vue` — drop the fixed `350×380px` card and Arial fallback fonts.
- **Landing/dashboard**: `HomePage.vue`, `LobbyPage.vue`, `dashboard-instructions.vue`, `active-quests.vue` — new hero treatment (SVG pattern, no stock photo/gradient).
- **Guilds**: `GuildList.vue`, `GuildPage.vue`, `GuildAdmin.vue`, `GuildChannelList.vue`, `CreateGuild.vue`, `guild-card.vue`, `guild-header.vue`, `guild-description.vue`, `guild-members.vue`, `guilds-table.vue`, `guilds-membership-indicator.vue`, `guilds-playing-indicator.vue`, `guildpage-instructions.vue`.
- **Quests**: `QuestList.vue`, `QuestEdit.vue`, `CreateQuest.vue`, `QuestPlayPage.vue`, `QuestTeamPage.vue`, `quest-card.vue` (drop `ivory` backgrounds), `quest-edit-card.vue`, `quest-table.vue`, `quest-list.vue`, `quest-details.vue`, `quest-actions.vue`, `quest-date-time-interval.vue`.
- **Roles**: `CreateRole.vue`, `RoleEdit.vue`, `role-card.vue`, `role-table.vue`, `role-node-constraint-card.vue`, `role-node-constraint-table.vue`, `casting_role_edit.vue`.
- **Conversation tree**: `NodeView.vue`, `ConversationColumn.vue`, `ConversationColumnEdit.vue`, `ChannelPage.vue`, `GameChannelList.vue`, `ChannelListComponent.vue`, `node-card.vue`, `node-form.vue`, `node-status-selector.vue`, `node-tree.vue`, `quest-node-tree.vue`, `ibis-column.vue`, `ibis-btn.vue` — keep IBIS icon imagery functionally as-is, restyle surrounding chrome only.
- **Admin/misc**: `AdminPage.vue`, `server-data-card.vue`, `member_game_registration.vue`, `member-handle.vue`, `edit-button.vue`, `read-status-counter-button.vue`, `score-board.vue`.
- **Static content**: `HouseRules.vue`, `instructions/*.vue` (9 files) + `instructions-layout.vue`, `ErrorNotFound.vue` (404 page — restyle off the current raw `bg-blue fullscreen`).

**Hard constraint for every file above:** do not change `name=`, `id=`, or `data-test=` attributes, route names/paths, or visible button/label text that Playwright/vitest select by role or text (e.g. `Register`, `Ongoing`, `Finished`, `Play`, `Go To Quest`, `Public`, the role radios `Critic`/`Game leader`/`Philosopher`/`Researcher`/`Scribe`, `login-btn`, `registration-btn`). Visual-only changes.

## Accessibility (WCAG 2.1 AA)

- Palette pairings verified ≥4.5:1 for body text, ≥3:1 for large text and UI borders.
- One `:focus-visible` token (2px outline + offset) applied globally via `app.scss`, so keyboard focus is visible on every interactive element, including icon-only buttons (sign-out, drawer toggles).
- All icon-only controls get `aria-label` + `q-tooltip` — sign-out is the explicit mandate example; the same pass audits other icon-only `q-btn`s (e.g. drawer toggles).
- Semantic structure: `PageHeader` renders an `h1` and a breadcrumb `nav`; list pages keep exactly one `h1` per page.

## Execution Strategy

1. Implement the token layer, app shell, and new shared components directly (`tokens.scss`, `components.scss`, `quasar.variables.scss`, `app.scss`, `quasar.config.js`, `MainLayout.vue`, `drawer_menu.vue`, `right-drawer.vue`, `PageHeader.vue`, `EmptyState.vue`) — these need to be precise and consistent since everything else consumes them.
2. Dispatch the mechanical per-page/component sweep (the Component Inventory Pass list) to parallel agents grouped by domain (auth, guilds, quests/roles, conversation-tree, admin/static), each given the token system and the hard constraint list above.
3. Spot-check a sample from each group and re-run verification.

## Verification

- `cd sc-client && npx eslint --ext .js,.ts,.vue ./` — catches broken template/style syntax.
- `cd sc-client && npx vitest run` — must stay green, especially `LeftDrawerMenuComponent.spec.ts` and `ChannelListComponent.spec.ts`, which assert on menu text/structure.
- `cd sc-client && npx playwright test --config src/playwright.config.ts -j1` (or at least `03-admin`, `04-create-quest`, `06-create-guild`, `08-guild-conversations`) — confirms `leftdrawerBtn`/`rightdrawerBtn`/`logoffBtn` selectors and drawer behavior still work.
- Launch the dev server (`quasar dev`) and manually walk: Home → Sign in → Lobby/Dashboard → Guild list → Guild page → Quest page → Admin, at mobile/tablet/desktop widths, tabbing through the header and drawer to confirm focus visibility and the sign-out tooltip/label.
