-- Jenni clone schema. Postgres 15+ (Supabase). All times timestamptz (UTC).
-- Access: Postgres row level security. Server (service role) does AI calls and metering.
create extension if not exists pgcrypto;
create extension if not exists vector;

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- accounts and billing ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  ui_language text not null default 'en',
  autocomplete_enabled boolean not null default true,
  search_filters jsonb not null default '{}',   -- chat/search filters shared across chats
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','plus','pro')),
  billing_interval text check (billing_interval in ('monthly','annual')),
  status text not null default 'active' check (status in ('active','past_due','cancel_scheduled','canceled')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  trial_ends_at timestamptz,
  period_start timestamptz not null default now(),
  period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- one row per (user, feature, window). window_start = day (free autocomplete), billing period, or epoch (lifetime)
create table usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  feature text not null check (feature in ('autocomplete','ai_edit','chat','review','workflow','pdf_upload')),
  window_kind text not null check (window_kind in ('day','period','lifetime')),
  window_start timestamptz not null,
  used integer not null default 0 check (used >= 0),
  unique (user_id, feature, window_kind, window_start)
);

create table stripe_events (            -- idempotency: webhooks arrive twice
  id text primary key,
  received_at timestamptz not null default now()
);

-- ---------- library ----------
create table sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  work_type text not null default 'article',
  title text not null,
  authors jsonb not null default '[]',      -- CSL-JSON author array
  year int,
  container_title text,
  doi text, pmid text, isbn text, external_id text,  -- external_id: OpenAlex id
  csl jsonb not null default '{}',          -- full CSL-JSON item for citeproc
  is_open_access boolean,
  citation_count int,
  impact_factor numeric,
  is_retracted boolean not null default false,
  is_preprint boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on sources (user_id, created_at desc);
create index on sources (user_id, doi);
create index on sources (user_id, year);

create table source_files (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  storage_key text not null,
  size_bytes bigint not null,
  page_count int,
  status text not null default 'queued' check (status in ('queued','processing','ready','failed','encrypted')),
  ocr_applied boolean not null default false,
  error text,
  created_at timestamptz not null default now()
);
create index on source_files (source_id);
create index on source_files (user_id, status);

-- passage level text for retrieval and "trace to source"
create table source_chunks (
  id uuid primary key default gen_random_uuid(),
  source_file_id uuid not null references source_files(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  page int not null,
  chunk_index int not null,
  text text not null,
  bbox jsonb,                               -- highlight rectangles on the page
  embedding vector(1024),
  tsv tsvector generated always as (to_tsvector('english', text)) stored,
  unique (source_file_id, chunk_index)
);
create index on source_chunks (user_id);
create index on source_chunks using gin (tsv);
create index on source_chunks using hnsw (embedding vector_cosine_ops);

create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  parent_id uuid references collections(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index on collections (user_id, parent_id);

create table collection_sources (
  collection_id uuid not null references collections(id) on delete cascade,
  source_id uuid not null references sources(id) on delete cascade,
  primary key (collection_id, source_id)
);
create index on collection_sources (source_id);

-- ---------- documents ----------
create table documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null default 'Untitled',
  language text not null default 'en',
  citation_style text not null default 'apa-7th',
  citation_locale text not null default 'en-US',
  show_page_numbers boolean not null default false,
  auto_cite_external boolean not null default true,
  auto_cite_library boolean not null default true,
  autocomplete_collection_ids uuid[] not null default '{}',
  document_prompt text not null default '' check (char_length(document_prompt) <= 5000),
  general_access text not null default 'restricted' check (general_access in ('restricted','link')),
  link_role text not null default 'viewer' check (link_role in ('editor','commenter','viewer')),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on documents (owner_id, updated_at desc) where archived_at is null;

-- realtime state (Yjs). Latest snapshot + incremental updates.
create table document_snapshots (
  document_id uuid primary key references documents(id) on delete cascade,
  ydoc bytea not null,
  text_content text not null default '',
  updated_at timestamptz not null default now()
);

create table document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  ydoc bytea not null,
  label text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index on document_versions (document_id, created_at desc);

create table collaborators (
  document_id uuid not null references documents(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('editor','commenter','viewer')),
  created_at timestamptz not null default now(),
  primary key (document_id, user_id)
);
create index on collaborators (user_id);

create table invitations (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  email text not null,
  role text not null default 'editor' check (role in ('editor','commenter','viewer')),
  status text not null default 'pending' check (status in ('pending','accepted','canceled')),
  token text not null unique default encode(gen_random_bytes(24),'hex'),
  created_at timestamptz not null default now(),
  unique (document_id, email)
);

create table access_requests (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  requester_id uuid not null references profiles(id) on delete cascade,
  requested_role text not null default 'viewer' check (requested_role in ('editor','commenter','viewer')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  unique (document_id, requester_id)
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  parent_id uuid references comments(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  anchor jsonb,                    -- Yjs relative positions
  body text not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index on comments (document_id, created_at);

-- Citations live in the editor doc; this index powers bibliography, library "used in", and exports.
create table citations (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  source_id uuid not null references sources(id) on delete restrict,
  kind text not null default 'parenthetical' check (kind in ('parenthetical','narrative','multiple','grouped')),
  page text,
  source_chunk_id uuid references source_chunks(id) on delete set null,  -- trace to passage
  created_at timestamptz not null default now()
);
create index on citations (document_id);
create index on citations (source_id);

create table section_prompts (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  heading_id text not null,
  text text not null default '' check (char_length(text) <= 5000),
  pinned_source_ids uuid[] not null default '{}',
  collection_id uuid references collections(id) on delete set null,
  sources_disabled boolean not null default false,
  unique (document_id, heading_id)
);

-- ---------- AI ----------
create table chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  document_id uuid references documents(id) on delete set null,   -- chat is private even on shared docs
  title text not null default 'New chat',
  citation_style text,
  web_mode text not null default 'ask' check (web_mode in ('off','ask','on')),
  library_mode text not null default 'ask' check (library_mode in ('off','ask','on')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on chat_threads (user_id, updated_at desc);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  body text not null check (char_length(body) <= 50000),
  status text not null default 'done' check (status in ('streaming','done','cancelled','failed')),
  context jsonb not null default '{}',     -- mentioned sources, collections, quote, attachments
  citations jsonb not null default '[]',   -- [{source_id, chunk_id, quote}]
  artifacts jsonb not null default '[]',   -- charts, mermaid, code runs
  created_at timestamptz not null default now()
);
create index on chat_messages (thread_id, created_at);

create table saved_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index on saved_prompts (user_id);

create table ai_edits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  document_id uuid not null references documents(id) on delete cascade,
  command text not null,
  selection_text text not null,
  result_text text,
  status text not null default 'pending' check (status in ('pending','accepted','discarded','failed')),
  created_at timestamptz not null default now()
);
create index on ai_edits (document_id, created_at desc);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('proofread','claim_confidence','source_quality','tone','peer_review')),
  scope text not null default 'document' check (scope in ('document','selection')),
  status text not null default 'running' check (status in ('running','done','failed','stopped')),
  summary text,
  score numeric,
  settings jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index on reviews (document_id, created_at desc);
-- only one running review per user at a time
create unique index one_running_review on reviews (user_id) where status = 'running';

create table review_suggestions (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  category text not null,
  anchor jsonb,
  original_text text,
  suggested_text text,
  reasoning text,
  source_chunk_id uuid references source_chunks(id) on delete set null,
  state text not null default 'open' check (state in ('open','accepted','rejected','kept','removed','replaced')),
  feedback smallint check (feedback in (-1,1))
);
create index on review_suggestions (review_id);

create table workflow_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null check (kind in ('literature_review','gap_analysis')),
  topic text not null check (char_length(topic) <= 5000),
  settings jsonb not null default '{}',
  status text not null default 'queued' check (status in ('queued','running','done','failed','canceled')),
  phase text,
  output_document_id uuid references documents(id) on delete set null,
  notify_email boolean not null default true,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index on workflow_runs (user_id, created_at desc);

-- ---------- bundled data ----------
create table citation_styles (
  id text primary key,                  -- CSL id, e.g. 'apa-7th'
  title text not null,
  is_default boolean not null default false,
  csl_storage_key text not null
);

-- ---------- triggers ----------
do $$ declare t text; begin
  foreach t in array array['profiles','subscriptions','sources','documents','chat_threads'] loop
    execute format('create trigger %I_updated before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- ---------- access rules ----------
create or replace function doc_role(doc uuid) returns text language sql stable security definer set search_path = public as $$
  select case
    when d.owner_id = auth.uid() then 'owner'
    else coalesce(
      (select c.role from collaborators c where c.document_id = d.id and c.user_id = auth.uid()),
      case when d.general_access = 'link' then d.link_role end)
  end
  from documents d where d.id = doc
$$;
create or replace function role_rank(r text) returns int language sql immutable as $$
  select case r when 'owner' then 4 when 'editor' then 3 when 'commenter' then 2 when 'viewer' then 1 else 0 end
$$;

alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table usage_counters enable row level security;
alter table sources enable row level security;
alter table source_files enable row level security;
alter table source_chunks enable row level security;
alter table collections enable row level security;
alter table collection_sources enable row level security;
alter table documents enable row level security;
alter table document_snapshots enable row level security;
alter table document_versions enable row level security;
alter table collaborators enable row level security;
alter table invitations enable row level security;
alter table access_requests enable row level security;
alter table comments enable row level security;
alter table citations enable row level security;
alter table section_prompts enable row level security;
alter table chat_threads enable row level security;
alter table chat_messages enable row level security;
alter table saved_prompts enable row level security;
alter table ai_edits enable row level security;
alter table reviews enable row level security;
alter table review_suggestions enable row level security;
alter table workflow_runs enable row level security;

-- own rows
create policy own on profiles using (id = auth.uid()) with check (id = auth.uid());
create policy own_read on subscriptions for select using (user_id = auth.uid());   -- writes: service role only
create policy own_read on usage_counters for select using (user_id = auth.uid());  -- writes: service role only
create policy own on sources using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own on source_files using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own on source_chunks using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own on collections using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own on collection_sources using (exists (select 1 from collections c where c.id = collection_id and c.user_id = auth.uid()));
create policy own on chat_threads using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own on chat_messages using (exists (select 1 from chat_threads t where t.id = thread_id and t.user_id = auth.uid()));
create policy own on saved_prompts using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own on ai_edits using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own on reviews using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own on review_suggestions using (exists (select 1 from reviews r where r.id = review_id and r.user_id = auth.uid()));
create policy own on workflow_runs using (user_id = auth.uid()) with check (user_id = auth.uid());

-- shared documents
create policy read on documents for select using (role_rank(doc_role(id)) >= 1);
create policy insert on documents for insert with check (owner_id = auth.uid());
create policy edit on documents for update using (role_rank(doc_role(id)) >= 3);
create policy del on documents for delete using (owner_id = auth.uid());
create policy read on document_snapshots for select using (role_rank(doc_role(document_id)) >= 1);
create policy read on document_versions for select using (role_rank(doc_role(document_id)) >= 1);
create policy read on collaborators for select using (role_rank(doc_role(document_id)) >= 1);
create policy owner_manage on collaborators using (doc_role(document_id) = 'owner') with check (doc_role(document_id) = 'owner');
create policy owner_manage on invitations using (doc_role(document_id) = 'owner') with check (doc_role(document_id) = 'owner');
create policy request on access_requests for insert with check (requester_id = auth.uid());
create policy see on access_requests for select using (requester_id = auth.uid() or doc_role(document_id) = 'owner');
create policy decide on access_requests for update using (doc_role(document_id) = 'owner');
create policy read on comments for select using (role_rank(doc_role(document_id)) >= 1);
create policy write on comments for insert with check (author_id = auth.uid() and role_rank(doc_role(document_id)) >= 2);
create policy edit_own on comments for update using (author_id = auth.uid());
create policy read on citations for select using (role_rank(doc_role(document_id)) >= 1);
create policy write on citations using (role_rank(doc_role(document_id)) >= 3) with check (role_rank(doc_role(document_id)) >= 3);
create policy read on section_prompts for select using (role_rank(doc_role(document_id)) >= 1);
create policy write on section_prompts using (role_rank(doc_role(document_id)) >= 3) with check (role_rank(doc_role(document_id)) >= 3);
