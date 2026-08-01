(function(root){
  const clamp=n=>Math.max(0,Math.min(100,n));
  const finite=v=>v!==null&&v!==undefined&&v!==""&&Number.isFinite(Number(v));
  const lerp=(value,points)=>{
    if(value<=points[0][0])return points[0][1];
    for(let i=1;i<points.length;i++)if(value<=points[i][0]){
      const [x0,y0]=points[i-1],[x1,y1]=points[i],t=(value-x0)/(x1-x0);
      return y0+(y1-y0)*t;
    }
    return points.at(-1)[1];
  };
  const wind=v=>lerp(v,[[0,55],[1,75],[1.5,90],[2.5,100],[4.5,90],[7,45],[10,10],[15,0]]);
  const direction=deg=>{
    const d=((deg%360)+360)%360;
    return lerp(d,[[0,35],[45,60],[90,85],[135,100],[180,100],[225,100],[270,85],[315,60],[360,35]]);
  };
  const air=v=>lerp(v,[[-5,0],[5,30],[10,60],[15,95],[20,100],[25,95],[28,65],[35,0]]);
  const water=v=>lerp(v,[[0,0],[10,35],[12,60],[15,90],[18,100],[20,100],[23,90],[25,60],[30,0]]);
  const wave=v=>lerp(v,[[0,60],[.15,85],[.4,100],[.7,90],[1.2,60],[2,20],[3,0]]);
  const clouds=v=>lerp(v,[[0,75],[35,95],[50,100],[70,95],[100,65]]);
  const sunshine=v=>lerp(v,[[0,60],[2,70],[6,85],[10,75],[14,65]]);
  function precipitation(rain,risk){
    const parts=[];
    if(finite(rain))parts.push([lerp(Number(rain),[[0,100],[.5,92],[2,72],[5,35],[10,0]]),.75]);
    if(finite(risk))parts.push([clamp(100-Number(risk)),.25]);
    if(!parts.length)return null;
    return parts.reduce((s,[v,w])=>s+v*w,0)/parts.reduce((s,[,w])=>s+w,0);
  }
  function score(row){
    const factors=[];
    const add=(id,label,weight,value)=>{if(finite(value))factors.push({id,label,weight,value:clamp(Number(value))})};
    if(finite(row.wind)){
      let value=wind(Number(row.wind));
      if(finite(row.windGust))value-=lerp(Number(row.windGust),[[0,0],[6,0],[9,15],[14,35],[20,50]]);
      add('wind','Vindstyrka',25,value);
    }
    if(finite(row.windDirection))add('windDirection','Vindriktning',15,direction(Number(row.windDirection)));
    add('dry','Nederbörd',20,precipitation(row.rain,row.risk));
    if(finite(row.cloudCover))add('cloudCover','Molnighet',15,clouds(Number(row.cloudCover)));
    else if(finite(row.sun))add('sun','Soltid',15,sunshine(Number(row.sun)));
    if(finite(row.temp))add('temperature','Lufttemperatur',15,air(Number(row.temp)));
    if(finite(row.waterTemperature))add('waterTemperature','Vattentemperatur',15,water(Number(row.waterTemperature)));
    if(finite(row.waveHeight)&&row.hasMarine!==false)add('waves','Våghöjd',10,wave(Number(row.waveHeight)));
    const totalWeight=factors.reduce((s,f)=>s+f.weight,0);
    const total=totalWeight?factors.reduce((s,f)=>s+f.value*f.weight,0)/totalWeight:0;
    return {score:clamp(total),factors};
  }
  root.VK_FISHING={score,curves:{wind,direction,air,water,wave,clouds,sunshine,precipitation}};
})(globalThis);
