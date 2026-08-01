(function(root){
  "use strict";
  function createManager(){
    let active=null;
    function run(key,task){
      if(active?.key===key)return active.promise;
      active?.controller.abort();
      const entry={key,controller:new AbortController(),promise:null};
      active=entry;
      try{entry.promise=Promise.resolve(task(entry.controller.signal))}
      catch(error){entry.promise=Promise.reject(error)}
      entry.promise=entry.promise.finally(()=>{
        if(active===entry)active=null;
      });
      return entry.promise;
    }
    function abort(){active?.controller.abort();active=null;}
    return {run,abort};
  }
  const api={createManager};
  root.VK_CLOUD_REQUESTS=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
