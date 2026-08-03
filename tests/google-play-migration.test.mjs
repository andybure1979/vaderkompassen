import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";
const sql=fs.readFileSync(new URL("../supabase/migrations/20260803_1502_google_play_billing.sql",import.meta.url),"utf8");
test("Google-tabell och RPC är privata",()=>{assert.match(sql,/google_notification_events enable row level security/i);assert.match(sql,/revoke all on public\.google_notification_events from public,anon,authenticated/i);assert.match(sql,/grant execute on function public\.sync_google_subscription[\s\S]+service_role/i)});
test("rå token lagras inte",()=>{assert.match(sql,/purchase_token_hash/);assert.doesNotMatch(sql,/purchase_token\s+text(?!_hash)/i)});
