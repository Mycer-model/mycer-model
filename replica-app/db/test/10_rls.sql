-- Two users, two workspaces. A user must see nothing of the other's data, and must not write money tables.
\set ON_ERROR_STOP on
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a','a@example.test'),
  ('00000000-0000-0000-0000-00000000000b','b@example.test');
insert into workspaces (id, name) values
  ('10000000-0000-0000-0000-00000000000a','A'), ('10000000-0000-0000-0000-00000000000b','B');
insert into members values
  ('10000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000a','owner', now()),
  ('10000000-0000-0000-0000-00000000000b','00000000-0000-0000-0000-00000000000b','owner', now());
insert into projects (id, workspace_id, name, created_by) values
  ('20000000-0000-0000-0000-00000000000a','10000000-0000-0000-0000-00000000000a','pa','00000000-0000-0000-0000-00000000000a'),
  ('20000000-0000-0000-0000-00000000000b','10000000-0000-0000-0000-00000000000b','pb','00000000-0000-0000-0000-00000000000b');
insert into credit_ledger (workspace_id, delta, reason) values
  ('10000000-0000-0000-0000-00000000000a', 125, 'plan_grant'), ('10000000-0000-0000-0000-00000000000b', 125, 'plan_grant');
insert into generations (id, workspace_id, user_id, kind, model, request, provider, credits_cost) values
  ('30000000-0000-0000-0000-00000000000b','10000000-0000-0000-0000-00000000000b','00000000-0000-0000-0000-00000000000b','image','m','{}','mock',4);
insert into assets (id, workspace_id, kind, storage_path, mime, bytes) values
  ('40000000-0000-0000-0000-00000000000b','10000000-0000-0000-0000-00000000000b','image','x','image/png',1);
insert into comments (asset_id, user_id, body) values ('40000000-0000-0000-0000-00000000000b','00000000-0000-0000-0000-00000000000b','secret');

set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';

do $$
declare n int;
begin
  select count(*) into n from workspaces;        assert n = 1, 'A sees only own workspace, saw '||n;
  select count(*) into n from members;           assert n = 1, 'A sees only own membership, saw '||n;
  select count(*) into n from projects;          assert n = 1, 'A sees only own project, saw '||n;
  select count(*) into n from generations;       assert n = 0, 'A must not see B generations, saw '||n;
  select count(*) into n from assets;            assert n = 0, 'A must not see B assets, saw '||n;
  select count(*) into n from comments;          assert n = 0, 'A must not see B comments, saw '||n;
  select count(*) into n from credit_ledger;     assert n = 1, 'A sees only own ledger, saw '||n;
  select count(*) into n from credit_balances;   assert n = 1, 'balance view must respect RLS, saw '||n;
end $$;

-- A must not read or write B's project.
do $$ declare n int; begin
  update projects set name = 'hacked' where id = '20000000-0000-0000-0000-00000000000b'; get diagnostics n = row_count;
  assert n = 0, 'A must not update B project';
  delete from projects where id = '20000000-0000-0000-0000-00000000000b'; get diagnostics n = row_count;
  assert n = 0, 'A must not delete B project';
end $$;

-- A must not insert into B's workspace.
do $$ begin
  begin
    insert into projects (workspace_id, name, created_by) values ('10000000-0000-0000-0000-00000000000b','x','00000000-0000-0000-0000-00000000000a');
    raise exception 'A inserted into B workspace';
  exception when insufficient_privilege then null; end;
end $$;

-- Members cannot write money tables, even in their own workspace.
do $$ begin
  begin
    insert into credit_ledger (workspace_id, delta, reason) values ('10000000-0000-0000-0000-00000000000a', 1000000, 'adjustment');
    raise exception 'member wrote to credit_ledger';
  exception when insufficient_privilege then null; end;
end $$;
do $$ begin
  begin
    insert into generations (workspace_id, user_id, kind, model, request, provider, credits_cost)
      values ('10000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000a','image','m','{}','mock',0);
    raise exception 'member wrote to generations';
  exception when insufficient_privilege then null; end;
end $$;

-- No session: nothing is visible.
reset request.jwt.claim.sub;
set request.jwt.claim.sub = '';
do $$ declare n int; begin
  select count(*) into n from projects; assert n = 0, 'anonymous sees nothing, saw '||n;
end $$;
\echo RLS OK
