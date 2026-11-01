# Recon map: Runway (web app + public API)

Scope: whole product (Creative web app, Dev API, Enterprise features). Robotics and Research are skipped.
For: the user's own business
Date: 2026-11-01

## Confidence note (read first)

The Creative app itself is behind a login, and the help center (help.runwayml.com) returns 403 to automated
reads. This map is built from public sources only: marketing site, pricing page, changelog and the public
API docs. **The API data model is high confidence. The web-app screen list is inferred from the pricing page
and the changelog and must be verified by a walkthrough of the user's own account.** Rows marked
"unverified" below need that walkthrough (screenshots go in `replica/screens/`).

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | marketing site | https://runway.com/ (runwayml.com redirects here) | three platforms: Creative, Dev, Robotics |
| 2 | pricing | https://runway.com/pricing | plans, credit costs per model, FAQ |
| 3 | changelog | https://runway.com/changelog | Aug to Oct 2026 features, plan gating |
| 4 | API docs | https://docs.dev.runwayml.com/ | primer: /ai-context.md, models: /guides/models.md |
| 5 | API llms.txt | https://docs.dev.runwayml.com/llms.txt | endpoint groups, Workflows, Characters |
| 6 | help center | https://help.runwayml.com | 403 to bots; read it in the browser |
| 7 | user's own account | https://app.runwayml.com (verify) | needed for every screen state |

## Core loop

Write a prompt (plus optional image, video or audio references), pick a model, spend credits, get a video, image
or audio asset, refine it with edit tools or the Agent, and export it.

## Screens (unverified: inferred, confirm against the real app)

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Sign up / login | Login, Try Runway | account, SSO for enterprise | form, social login | unverified |
| S02 | Home / dashboard | after login | start a generation, recent work | prompt box, tool shortcuts, recents | empty, filled |
| S03 | Generate (Tool Mode) | home -> tool | prompt, model selector, ratio, duration, references, generate | model picker, reference slots, credit cost | idle, queued, running, failed, moderated |
| S04 | Agent chat | Agent | conversational creative collaborator that plans and runs generations | chat, attachments, draft toggle | empty, running, result |
| S05 | Workflows editor | Workflows | node graph: inputs, models, compositing, outputs; publish as versions | canvas, nodes, run panel | empty, running, node error |
| S06 | Project page | Projects | group assets, Brand Kits, sessions | asset grid, project list | empty, filled, credit cap reached (enterprise) |
| S07 | Asset page | click an asset | preview, details, comments, @Agent | player, comment thread, download | loading, error |
| S08 | Edit Studio | asset -> edit | edit and enhance a clip (upscale, frame rate, Aleph restyle, background removal) | timeline or tool panel | unverified |
| S09 | Brand Kit | Brand Kits | grouped assets and text reused as references | asset group, text fields | empty, filled |
| S10 | App Studio | App Studio (paid) | describe an app in plain language, it builds and hosts it | prompt, preview, publish | unverified |
| S11 | Runway Ads | Ads (paid) | read ad performance on Meta/Google/TikTok, generate variants, publish approved | connect accounts, variant grid, approve | unverified |
| S12 | Plans & Billing | settings | plan, credit balance, top-up (min 1,000), invoices | plan cards, credit buy | free, paid, over limit |
| S13 | Workspace / team settings | settings | seats, members, shared credit pool, roles | member table, invite | unverified |
| S14 | Org settings (enterprise) | admin | SSO, default SSO, alerts, credit caps, audit logs | SSO form, alerts | unverified |
| S15 | Developer portal | https://dev.runway.com | API keys, usage tiers, billing, embed tab | key list, usage chart | unverified |
| S16 | Pricing page (public) | /pricing | plan table, per-model credit costs | monthly/yearly toggle, FAQ | public |
| S17 | Mobile app (iOS/Android) | stores | same core loop on phone | unverified | unverified |

## Flows

```
F01 New user generates a first video
    S01 -> S02 -> S03 -> (queued) -> S07
    happy path clicks: ~5 (unverified)
    edge: out of credits (free plan 125 one-time), moderated prompt, model retired, aspect ratio crop

F02 Draft then enhance (Seedance 2.5 draft mode)
    S03/S04 draft 480p -> S07 review -> enhance to 1080p (within 7 days)
    edge: preview already enhanced, different account

F03 Agent builds a piece from a brief
    S04 -> uses Brand Kit (S09) -> generates -> S07
    edge: asset comments @Agent (enterprise), project assets

F04 Build and publish a Workflow, call it from the API
    S05 -> publish version -> S15 key -> POST /v1/workflows/{id} -> poll invocation
    edge: node uses a retired model (400), key from a different project (404), node errors on a SUCCEEDED run

F05 Upgrade and buy credits
    S12 -> pick plan -> prorated upgrade; top-up from 1,000 credits
    edge: downgrade keeps plan to end of cycle; Max rolls over 1 month, others reset

F06 Team collaboration
    S13 invite -> shared projects -> comment on generation (S07)
    edge: enterprise credit cap per project pauses generation

F07 Run Runway from an agent or editor (MCP, Adobe, DaVinci, Cursor)
    OAuth with Runway account -> generate via MCP
```

## Components (unverified, from product descriptions)

| component | variants | states | used on |
| --- | --- | --- | --- |
| Button | primary, secondary, ghost, destructive | default, hover, focus, disabled, loading | all |
| Prompt box with reference slots | text, image, video, audio | empty, filled, over limit | S02, S03, S04 |
| Model picker | by capability, with credit cost | default, locked by plan | S03 |
| Task/progress card | video, image, audio | pending, throttled, running, succeeded, failed, cancelled | S02, S06, S07 |
| Asset grid / player | video, image, audio | loading, error | S06, S07 |
| Comment thread | with @mention of Agent | empty, filled | S07 |
| Node (workflow) | input, model, compositing, output | idle, running, error | S05 |
| Plan card, credit meter | free, standard, pro, max, team | current, upgrade | S12 |
| Toast / modal / dropdown | | | all |

## Inferred data model

```
User / Workspace / Organization   plan, seats, shared credit pool, SSO config (enterprise)
            evidence: Team plan changelog, org config alerts, Organization endpoints
            confidence: medium
Project     assets, Brand Kits, Agent sessions, optional credit cap
            evidence: changelog (Projects + Brand Kits in Agent, Project Credit Caps)
            confidence: medium
Task        id (uuid), status PENDING|THROTTLED|RUNNING|SUCCEEDED|FAILED|CANCELLED, output[] (temp URLs),
            failure, failureCode, model, request body (per-model union)
            evidence: API primer
            confidence: high
Asset       media file (video|image|audio), prompt, model, params, comments, project
            evidence: asset page, API outputs (URLs are temporary)
            confidence: medium
BrandKit    named group of assets and text, referenceable by Agent and MCP
            evidence: changelog Sep 8 and Sep 18
            confidence: medium
Workflow    node graph, versions (each publish immutable), inputs (exposedToApp), outputs
WorkflowInvocation  id, nodeOutputs, output, nodeErrors, status
            evidence: API docs Workflows section
            confidence: high
Avatar / Session / Document / Voice   reusable character, live conversation, knowledge doc, designed or cloned voice
            evidence: API docs Characters
            confidence: high
ModelRouterConfig   configId, allow/deny lists, per-modality credit ceilings, optimize (cost|latency|quality)
            evidence: API docs Model Router
            confidence: high
Credits     balance, monthly allotment, rollover, purchased (never expire), usage log
            evidence: pricing FAQ
            confidence: high
ApiKey / UsageTier   project-owned key, rate limits per tier
            evidence: API primer
            confidence: high
```

Relationships: Workspace 1-n Project, Project 1-n Asset, Project 1-n BrandKit, Project 1-n AgentSession,
Workspace 1-n Workflow, Workflow 1-n Version, Version 1-n Invocation, User 1-n Task, Task 1-n Asset (outputs),
Avatar 1-n Document, Avatar 1-n Session.

## Feature matrix

See `features.csv`. The counts are in the five-line summary.

## Out of scope (cannot or should not be cloned)

- The generative models (Gen-4.5, Aleph 2.0, Ruby, Act-Two, GWM-1). The clone must call a third-party model API.
- Third-party models resold on Runway (Kling, Seedance, Nano Banana, Ideogram, Wan, ElevenLabs, Lyria and others): licensing terms apply to your own account.
- Runway's brand, logos, name and copy.
- The 60M user base, Creative Partners Program, Academy, events and the talent network.
- Robotics and Research products (policy models, world simulation).
- Enterprise contracts, data-security attestations and SOC reports.
- Native Adobe, DaVinci and Cursor integrations depend on partner approval.

## Size

Screens 17, flows 7, entities about 12. Hard parts: async generation queue with throttling and per-model
request schemas, credit billing and plan rules, the node-graph Workflows editor, realtime Characters
(video + voice), video editing tools, Ads/App Studio (agents with external accounts), team and enterprise
controls (SSO, caps, audit logs). Size: **XL**. The skill advises a rescope. A sensible first cut is the
core loop plus credits plus projects, which is **M to L**.
