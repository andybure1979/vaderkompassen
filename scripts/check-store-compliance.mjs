import {access,readFile} from "node:fs/promises";

const root=new URL("../",import.meta.url),config=JSON.parse(await readFile(new URL("config/store-compliance.json",root),"utf8"));
const allowed=new Set(["complete","manual_action_required","blocked","not_applicable"]),missing=[],invalid=[];
for(const [name,item] of Object.entries(config.items||{})){
  if(!allowed.has(item.status))invalid.push(`${name}: ogiltig status ${item.status}`);
  for(const file of item.evidence||[])try{await access(new URL(file,root))}catch{missing.push(`${name}: ${file}`)}
}
const groups=status=>Object.entries(config.items).filter(([,item])=>item.status===status);
console.log(`Store compliance v${config.version}`);
for(const status of ["complete","manual_action_required","blocked","not_applicable"]){
  const entries=groups(status);console.log(`\n${status.toUpperCase()} (${entries.length})`);
  for(const [name,item] of entries)console.log(`- ${name}${item.note?`: ${item.note}`:""}`);
}
if(missing.length||invalid.length){console.error("\nKODFEL");for(const value of [...missing,...invalid])console.error(`- ${value}`)}
const blockers=groups("blocked");
if(blockers.length)console.error(`\nPRODUKTION BLOCKERAD: ${blockers.map(([name])=>name).join(", ")}`);
process.exitCode=missing.length||invalid.length||blockers.length?1:0;
