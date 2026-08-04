import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const worker=await readFile(new URL("../cloudflare/src/index.js",import.meta.url),"utf8");
const app=await readFile(new URL("../app.js",import.meta.url),"utf8");
const migration=await readFile(new URL("../supabase/migrations/20260801_1436_prebuilt_forecast_rankings.sql",import.meta.url),"utf8");
const packageJson=JSON.parse(await readFile(new URL("../package.json",import.meta.url),"utf8"));
const wrangler=await readFile(new URL("../wrangler.jsonc",import.meta.url),"utf8");
const cloudflareWrangler=await readFile(new URL("../cloudflare/wrangler.toml",import.meta.url),"utf8");

test("deploykontraktet använder root-entrypoint och samma releaseversion",()=>{
  assert.equal(packageJson.version,"15.0.6");
  assert.equal(packageJson.scripts.deploy,"wrangler deploy --config wrangler.jsonc");
  assert.match(wrangler,/"main": "cloudflare\/src\/index\.js"/);
  assert.match(wrangler,/"APP_VERSION": "15\.0\.6"/);
  assert.match(worker,/workerVersion:env\.APP_VERSION\|\|'15\.0\.6'/);
});

test("snapshotjobbet körs en gång per hel timme i båda deploykonfigurationerna",()=>{
  assert.match(wrangler,/"crons": \["0 \* \* \* \*"\]/);
  assert.match(cloudflareWrangler,/crons = \["0 \* \* \* \*"\]/);
  assert.doesNotMatch(wrangler,/\*\/30/);
  assert.doesNotMatch(cloudflareWrangler,/\*\/30/);
});

test("rankingtabeller är privata och endast färdiga versioner blir läsbara",()=>{
  assert.match(migration,/create table if not exists public\.forecast_ranking_versions/i);
  assert.match(migration,/create table if not exists public\.forecast_rankings/i);
  assert.match(migration,/status text not null default 'building'.*'ready'/is);
  assert.match(migration,/enable row level security/ig);
  assert.match(migration,/revoke all on table public\.forecast_rankings from public, anon, authenticated/i);
  assert.match(migration,/revoke all on table public\.forecast_ranking_versions from public, anon, authenticated/i);
  assert.doesNotMatch(migration,/grant .* to anon|grant .* to authenticated/i);
  assert.match(worker,/status:'eq\.ready'/);
});

test("frontend skiljer endast transportmängd och polling efter befintlig entitlement",()=>{
  assert.match(app,/days:hasPremiumUiAccess\(\)\?"all":"1"/);
  assert.match(app,/const FREE_REFRESH_MS=30\*60\*1000/);
  assert.match(app,/const PREMIUM_REFRESH_MS=15\*60\*1000/);
  assert.match(app,/headers\["If-None-Match"\]=validator\.etag/);
  assert.match(app,/if\(response\.status===304\)return \{notModified:true/);
  assert.match(app,/document\.visibilityState==="hidden"/);
});

test("Worker exponerar snapshot-, cache- och prestandadiagnostik",()=>{
  for(const header of ["X-Vaderkompassen-Snapshot-Version","X-Vaderkompassen-Worker-Version","X-Vaderkompassen-Cache","X-Vaderkompassen-Rows-Read","X-Vaderkompassen-Rows-Returned","X-Vaderkompassen-Response-Bytes","X-Vaderkompassen-Total-Ms","X-Vaderkompassen-Worker-CPU-Approx-Ms","X-Vaderkompassen-Supabase-Calls"]){
    assert.match(worker,new RegExp(header));
  }
  assert.match(worker,/stale-while-revalidate=600/);
  assert.match(worker,/notModifiedResponse/);
});
