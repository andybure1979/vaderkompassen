import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const packageJson=JSON.parse(await readFile(new URL("../package.json",import.meta.url),"utf8"));
const baseUrl=(process.env.VK_WORKER_URL||"https://vaderkompassen.andreas-bure.workers.dev").replace(/\/+$/,'');
const response=await fetch(`${baseUrl}/health`,{headers:{accept:"application/json"}});
assert.equal(response.ok,true,`Worker health svarade ${response.status}`);
const body=await response.json();
assert.equal(body.version,packageJson.version,`Deploy mismatch: Git ${packageJson.version}, Worker ${body.version||"okänd"}`);
assert.equal(body.workerVersion,packageJson.version,`WorkerVersion mismatch: ${body.workerVersion||"saknas"}`);
console.log(`Verifierad Worker ${body.workerVersion} på ${baseUrl}`);

