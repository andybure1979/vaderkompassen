import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const sql=await readFile(new URL("../supabase/migrations/20260801_1420_subscription_foundation.sql",import.meta.url),"utf8");

test("migrationen aktiverar RLS och saknar klientskrivpolicyer",()=>{
  for(const table of ["subscriptions","trial_entitlements","subscription_audit_log"])
    assert.match(sql,new RegExp(`alter table public\\.${table} enable row level security`,"i"));
  assert.doesNotMatch(sql,/create policy[^;]+for (insert|update|delete) to authenticated/is);
  assert.match(sql,/revoke all on public\.subscriptions from anon, authenticated/i);
});

test("säkerhetsdefinierade RPC:er har fast search_path och begränsade grants",()=>{
  for(const fn of ["get_user_entitlement","start_manual_test_trial","cancel_manual_test_subscription","end_manual_test_subscription_now"]){
    assert.match(sql,new RegExp(`function public\\.${fn}`));
    assert.match(sql,new RegExp(`revoke all on function public\\.${fn}[^;]+from public, anon`,"i"));
  }
  assert.match(sql,/security definer set search_path = public, pg_temp/gi);
  assert.match(sql,/revoke all on function public\.start_premium_trial\(\) from public, anon, authenticated/i);
  assert.match(sql,/revoke all on function public\.cancel_premium_subscription\(\) from public, anon, authenticated/i);
});

test("trial är unik och manual_test kan inte bli automatisk betalprovider",()=>{
  assert.match(sql,/primary key\(user_id, product_id, provider\)/i);
  assert.match(sql,/values\(uid,'manual_test','premium_monthly_test','trialing'/i);
  const manualInsert=sql.match(/insert into public\.subscriptions\(([^)]+)\)\s+values\(uid,'manual_test'/i);
  assert.ok(manualInsert);assert.doesNotMatch(manualInsert[1],/provider_payload/i);
});
