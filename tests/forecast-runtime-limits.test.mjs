import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const worker=await readFile(new URL("../cloudflare/src/index.js",import.meta.url),"utf8");
const sql=await readFile(new URL("../supabase/migrations/20260801_1431_forecast_runtime_limits.sql",import.meta.url),"utf8");

test("cron använder stora fasta batcher utan rekursiva nätverksförsök",()=>{
  assert.match(worker,/chunks\(PLACES,30\)/);
  assert.match(worker,/chunks\(marinePlaces,30\)/);
  assert.doesNotMatch(worker,/return fetchWeatherBatch\(batch,attempt\+1\)/);
  assert.doesNotMatch(worker,/fetchAdaptive\(batch\.slice/);
});

test("forecast-RPC använder lagrade serverScores och max 75 per dag",()=>{
  assert.match(sql,/r\.value->'serverScores'->>p_activity/);
  assert.match(sql,/row_number\(\) over\(partition by forecast_day order by score desc/i);
  assert.match(sql,/rank_position<=least\(greatest\(coalesce\(p_limit,75\),1\),75\)/i);
  assert.match(sql,/r\.value->>'place'=any\(p_places\)/i);
  assert.doesNotMatch(sql,/VK_FISHING|serverScore\(/);
});

test("forecast-RPC är endast tillgänglig för Worker service role",()=>{
  assert.match(sql,/revoke all on function public\.get_ranked_forecast[\s\S]*from public,anon,authenticated/i);
  assert.match(sql,/grant execute on function public\.get_ranked_forecast[\s\S]*to service_role/i);
});
