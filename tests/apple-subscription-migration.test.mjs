import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const sql=await readFile(new URL("../supabase/migrations/20260803_1501_apple_storekit.sql",import.meta.url),"utf8");
test("Apple-tabellen är privat och notiser är idempotenta",()=>{
  assert.match(sql,/apple_notification_events[\s\S]+notification_uuid uuid primary key/i);
  assert.match(sql,/enable row level security/i);assert.match(sql,/revoke all on public\.apple_notification_events from public,anon,authenticated/i);
  assert.doesNotMatch(sql,/create policy[\s\S]+apple_notification_events/i);
});
test("endast service role kan skriva verifierad Apple-entitlement",()=>{
  assert.match(sql,/function public\.sync_apple_subscription/i);
  assert.match(sql,/security definer[\s\S]+set search_path=public,pg_temp/i);
  assert.match(sql,/revoke all on function public\.sync_apple_subscription[\s\S]+from public,anon,authenticated/i);
  assert.match(sql,/grant execute on function public\.sync_apple_subscription[\s\S]+to service_role/i);
  assert.match(sql,/p_app_account_token<>p_user_id/i);
});
