(function(root){
  "use strict";
  function createRefreshController({refresh,now=()=>Date.now(),backgroundThresholdMs=5*60*1000,resumeDedupeMs=1500,onState=()=>{}}={}){
    let activePromise=null,backgroundAt=null,lastResumeAt=0,pullStart=null,pullDistance=0;
    const state=(active,reason="")=>onState({active,reason});
    function request(reason="manual"){
      if(activePromise)return activePromise;
      state(true,reason);
      activePromise=Promise.resolve().then(()=>refresh(reason)).finally(()=>{activePromise=null;state(false,reason)});
      return activePromise;
    }
    function setActive(isActive){
      const timestamp=now();
      if(!isActive){backgroundAt??=timestamp;cancelPull();return null}
      if(backgroundAt===null)return null;
      const elapsed=timestamp-backgroundAt;backgroundAt=null;
      if(elapsed<backgroundThresholdMs||timestamp-lastResumeAt<resumeDedupeMs)return null;
      lastResumeAt=timestamp;return request("resume");
    }
    function startPull(y,canStart){
      if(activePromise||!canStart){cancelPull();return false}
      pullStart=Number(y);pullDistance=0;return Number.isFinite(pullStart);
    }
    function movePull(y){
      if(pullStart===null)return 0;
      pullDistance=Math.max(0,Math.min(110,(Number(y)-pullStart)*.55));return pullDistance;
    }
    function endPull(threshold=64){
      const shouldRefresh=pullStart!==null&&pullDistance>=threshold;
      cancelPull();return shouldRefresh?request("pull"):null;
    }
    function cancelPull(){pullStart=null;pullDistance=0}
    return Object.freeze({request,setActive,startPull,movePull,endPull,cancelPull,isRefreshing:()=>Boolean(activePromise)});
  }
  const api={createRefreshController};root.VK_REFRESH=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
