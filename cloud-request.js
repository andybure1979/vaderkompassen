(function(root){
  "use strict";
  function normalizedValues(values){
    return [...new Set(Array.from(values||[],value=>String(value).trim()).filter(Boolean))]
      .sort((a,b)=>a.localeCompare(b,"sv"));
  }
  function createRequestKey(baseUrl,{activity="general",regions=[],areas=[]}={}){
    const params=new URLSearchParams();
    params.set("activity",String(activity||"general").trim()||"general");
    const normalizedRegions=normalizedValues(regions),normalizedAreas=normalizedValues(areas);
    if(normalizedRegions.length)params.set("regions",normalizedRegions.join(","));
    if(normalizedAreas.length)params.set("areas",normalizedAreas.join(","));
    return `${String(baseUrl).replace(/\/$/,"")}/v1/forecast?${params}`;
  }
  function createManager({onEvent=()=>{}}={}){
    let active=null;
    function run(key,task){
      if(active?.key===key){onEvent("reuse",key);return active.promise}
      if(active){onEvent("abort",active.key);active.controller.abort()}
      const entry={key,controller:new AbortController(),promise:null};
      active=entry;
      onEvent("start",key);
      try{entry.promise=Promise.resolve(task(entry.controller.signal))}
      catch(error){entry.promise=Promise.reject(error)}
      entry.promise=entry.promise.finally(()=>{
        if(active===entry){active=null;onEvent("settled",key)}
      });
      return entry.promise;
    }
    function abort(){active?.controller.abort();active=null;}
    return {run,abort};
  }
  const api={createManager,createRequestKey};
  root.VK_CLOUD_REQUESTS=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
