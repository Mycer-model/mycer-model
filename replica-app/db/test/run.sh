#!/usr/bin/env bash
# Usage: PGHOST=... PGPORT=... PGUSER=postgres db/test/run.sh   (needs a scratch Postgres 15+; creates and drops a database)
set -euo pipefail
cd "$(dirname "$0")"
DB=replica_rls_test
psql -v ON_ERROR_STOP=1 -qc "drop database if exists $DB" -c "create database $DB"
trap 'psql -qc "drop database if exists $DB" >/dev/null' EXIT
for f in 00_supabase_stub.sql ../migrations/0001_init.sql 10_rls.sql; do psql -v ON_ERROR_STOP=1 -q -d $DB -f $f; done
