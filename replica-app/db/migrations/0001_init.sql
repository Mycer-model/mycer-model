-- Runway clone: first migration (scope: core loop + credits + projects + brand kits + comments)
-- Access rules: row level security on every table (see the end of this file).
create extension if not exists pgcrypto;

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free' check (plan in ('free','standard','pro','max','team')),
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index on members (user_id);

create table projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  credit_cap integer check (credit_cap is null or credit_cap >= 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on projects (workspace_id, created_at desc);

-- One generation job. Request body differs per model, so it is jsonb validated per model in code.
create table generations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete restrict,
  kind text not null check (kind in ('video','image','audio')),
  model text not null,
  request jsonb not null,
  status text not null default 'pending'
    check (status in ('pending','throttled','running','succeeded','failed','cancelled')),
  failure text,
  failure_code text,
  provider text not null,
  provider_task_id text,
  credits_cost integer not null check (credits_cost >= 0),
  draft_of uuid references generations(id) on delete set null,
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key)
);
create index on generations (workspace_id, created_at desc);
create index on generations (project_id, created_at desc);
create index on generations (status) where status in ('pending','throttled','running');
create index on generations (provider, provider_task_id);

-- Stored output. Provider URLs are temporary, so we copy to our own storage.
create table assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  generation_id uuid references generations(id) on delete set null,
  kind text not null check (kind in ('video','image','audio')),
  storage_path text not null,
  mime text not null,
  bytes bigint not null check (bytes >= 0),
  width integer, height integer, duration_ms integer,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);
create index on assets (workspace_id, created_at desc) where deleted_at is null;
create index on assets (project_id) where deleted_at is null;
create index on assets (generation_id);

-- Credits are an append-only ledger. Balance = sum(delta). Purchased credits never expire.
create table credit_ledger (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  delta integer not null,
  reason text not null check (reason in ('plan_grant','purchase','generation','refund','rollover','adjustment')),
  expires_at timestamptz,
  generation_id uuid references generations(id) on delete set null,
  stripe_event_id text unique,       -- idempotency for webhooks
  created_at timestamptz not null default now()
);
create index on credit_ledger (workspace_id, created_at desc);
create unique index on credit_ledger (generation_id, reason) where reason in ('generation','refund');

create view credit_balances with (security_invoker = true) as
  select workspace_id, sum(delta)::integer as balance
  from credit_ledger
  where expires_at is null or expires_at > now()
  group by workspace_id;

create table brand_kits (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on brand_kits (workspace_id);

create table brand_kit_items (
  id uuid primary key default gen_random_uuid(),
  brand_kit_id uuid not null references brand_kits(id) on delete cascade,
  asset_id uuid references assets(id) on delete cascade,
  text_value text,
  check (asset_id is not null or text_value is not null)
);
create index on brand_kit_items (brand_kit_id);

create table comments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index on comments (asset_id, created_at);

create table api_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  key_hash text not null unique,     -- store only a hash
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index on api_keys (workspace_id);


-- ---------- Row level security ----------
-- A row is visible when the caller is a member of its workspace. Writes to money-like tables
-- (credit_ledger, generations) are server-only (service role bypasses RLS); members can only read.
create function is_member(ws uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from members m where m.workspace_id = ws and m.user_id = auth.uid()) $$;
create function is_admin(ws uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from members m where m.workspace_id = ws and m.user_id = auth.uid() and m.role in ('owner','admin')) $$;

alter table workspaces enable row level security;
create policy workspaces_read on workspaces for select using (is_member(id));
create policy workspaces_update on workspaces for update using (is_admin(id));

alter table members enable row level security;
create policy members_read on members for select using (user_id = auth.uid() or is_member(workspace_id));
create policy members_admin_write on members for all using (is_admin(workspace_id));

alter table projects enable row level security;
create policy projects_all on projects using (is_member(workspace_id));
alter table assets enable row level security;
create policy assets_all on assets using (is_member(workspace_id));
alter table brand_kits enable row level security;
create policy brand_kits_all on brand_kits using (is_member(workspace_id));
alter table api_keys enable row level security;
create policy api_keys_admin on api_keys using (is_admin(workspace_id));

alter table generations enable row level security;
create policy generations_read on generations for select using (is_member(workspace_id));
alter table credit_ledger enable row level security;
create policy credit_ledger_read on credit_ledger for select using (is_member(workspace_id));

alter table brand_kit_items enable row level security;
create policy brand_kit_items_all on brand_kit_items
  using (exists (select 1 from brand_kits k where k.id = brand_kit_id and is_member(k.workspace_id)));
alter table comments enable row level security;
create policy comments_read on comments for select
  using (exists (select 1 from assets a where a.id = asset_id and is_member(a.workspace_id)));
create policy comments_write on comments for insert
  with check (user_id = auth.uid() and exists (select 1 from assets a where a.id = asset_id and is_member(a.workspace_id)));

-- Stripe webhook idempotency and subscription state (written by the server only)
create table stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);
alter table stripe_events enable row level security;  -- no policy: service role only

create table subscriptions (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  stripe_subscription_id text unique,
  status text not null check (status in ('active','past_due','canceled','incomplete','trialing')),
  plan text not null check (plan in ('free','standard','pro','max','team')),
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);
alter table subscriptions enable row level security;
create policy subscriptions_read on subscriptions for select using (is_member(workspace_id));

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
