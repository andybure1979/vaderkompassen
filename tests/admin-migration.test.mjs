import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const sql=await readFile(new URL("../supabase/migrations/20260801_1430_admin_console.sql",import.meta.url),"utf8");
const frontend=await readFile(new URL("../admin.js",import.meta.url),"utf8");

test("admintabeller har RLS och saknar direkta klientgrants",()=>{
  for(const table of ["admin_entitlements","admin_audit_log","admin_user_notes"]){
    assert.match(sql,new RegExp(`alter table public\\.${table} enable row level security`,"i"));
    assert.match(sql,new RegExp(`revoke all on public\\.${table} from public, anon, authenticated`,"i"));
  }
});

test("alla admin-RPC:er använder fast search_path och serverkontroll",()=>{
  for(const fn of ["admin_get_dashboard_summary","admin_search_users","admin_get_user_detail","admin_grant_vip","admin_revoke_vip","admin_set_user_role","admin_set_account_status","admin_add_user_note","admin_end_manual_test","admin_extend_manual_test","admin_list_audit"]){
    const start=sql.indexOf(`function public.${fn}`);
    assert.ok(start>=0,`${fn} saknas`);
    const body=sql.slice(start,start+2500);
    assert.match(body,/security definer set search_path = public(?:, auth)?, pg_temp/i);
    assert.match(body,/is_current_user_admin\(\)/i);
  }
});

test("VIP är separat entitlement och butiksposter fabriceras inte",()=>{
  assert.match(sql,/create table if not exists public\.admin_entitlements/i);
  assert.doesNotMatch(sql,/insert into public\.subscriptions[\s\S]{0,300}(?:'apple'|'google')/i);
  assert.match(sql,/admin_entitlement/);
});

test("roll- och kontoskydd kräver anledning och hindrar självlåsning",()=>{
  assert.match(sql,/Bekräftelsen GE ADMIN krävs/);
  assert.match(sql,/sista aktiva Admin-rollen/);
  assert.match(sql,/Admin kan inte blockera sitt eget konto/);
  assert.match(sql,/Anledning krävs \(3–500 tecken\)/);
});

test("frontend söker serverbaserat, debouncar och skickar bearer-token till health",()=>{
  assert.match(frontend,/setTimeout\(\(\)=>search\(true\),350\)/);
  assert.match(frontend,/admin_search_users/);
  assert.match(frontend,/authorization:`Bearer \$\{token\}`/);
  assert.doesNotMatch(frontend,/service.role|service_role/i);
});
