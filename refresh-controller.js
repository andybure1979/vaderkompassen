(function(root){
  "use strict";
  function createRefreshController({refresh,now=()=>Date.now(),backgroundThresholdMs=5*60*1000,resumeDedupeMs=1500,onState=()=>{},onEvent=()=>{}}={}){
    let activePromise=null,backgroundAt=null,lastResumeAt=0,pullStart=null,pullDistance=0,thresholdReached=false;
    const state=(active,reason="")=>onState({active,reason});
    const emit=(type,detail={})=>onEvent({type,...detail});
    function request(reason="manual"){
      if(activePromise)return activePromise;
      state(true,reason);emit("refreshStarted",{reason});
      activePromise=Promise.resolve().then(()=>refresh(reason)).then(result=>{
        if(result?.status==="current")emit("refreshUnchanged",{reason});
        else if(result?.status==="updated")emit("refreshCompleted",{reason});
        else if(result?.status==="error")emit("refreshFailed",{reason});
        return result;
      },error=>{emit("refreshFailed",{reason});throw error}).finally(()=>{activePromise=null;state(false,reason)});
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
      pullStart=Number(y);pullDistance=0;thresholdReached=false;
      if(Number.isFinite(pullStart)){emit("pullStart");return true}
      cancelPull();return false;
    }
    function movePull(y){
      if(pullStart===null)return 0;
      pullDistance=Math.max(0,Math.min(110,(Number(y)-pullStart)*.55));
      emit("pullDistanceChanged",{distance:Math.round(pullDistance)});
      if(pullDistance>=64&&!thresholdReached){thresholdReached=true;emit("thresholdReached")}
      if(pullDistance<64)thresholdReached=false;
      return pullDistance;
    }
    function endPull(threshold=64){
      const shouldRefresh=pullStart!==null&&pullDistance>=threshold;
      cancelPull();return shouldRefresh?request("pull"):null;
    }
    function cancelPull(){pullStart=null;pullDistance=0;thresholdReached=false}
    return Object.freeze({request,setActive,startPull,movePull,endPull,cancelPull,isRefreshing:()=>Boolean(activePromise)});
  }
  const api={createRefreshController};root.VK_REFRESH=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
