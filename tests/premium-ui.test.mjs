import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const auth=await readFile(new URL("../auth.js",import.meta.url),"utf8");

test("alla aktiva inloggade roller kan öppna Premiumstatus",()=>{
  assert.match(auth,/upgradePremium"\)\.classList\.toggle\("hidden", accountStatus!=="active"\)/);
  assert.match(auth,/mayStartTrial \? "Prova Premium gratis i 3 dagar" : "Visa Premiumstatus"/);
  assert.doesNotMatch(auth,/upgradePremium"\)\.classList\.toggle\("hidden", !mayStartTrial\)/);
});
