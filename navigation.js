(function(root){
  "use strict";
  function coordinates(place){
    if(place?.lat===null||place?.lat===undefined||place?.lat===""||place?.lon===null||place?.lon===undefined||place?.lon==="")return null;
    const lat=Number(place?.lat),lon=Number(place?.lon);
    return Number.isFinite(lat)&&lat>=-90&&lat<=90&&Number.isFinite(lon)&&lon>=-180&&lon<=180?{lat,lon}:null;
  }
  function buildGoogleMapsUrl(place){
    const point=coordinates(place);if(!point)return null;
    const url=new URL("https://www.google.com/maps/dir/");
    url.searchParams.set("api","1");url.searchParams.set("destination",`${point.lat},${point.lon}`);
    return url.toString();
  }
  function buildAppleMapsUrl(place){
    const point=coordinates(place);if(!point)return null;
    const url=new URL("https://maps.apple.com/");
    url.searchParams.set("daddr",`${point.lat},${point.lon}`);
    const label=String(place?.label||place?.name||"").trim();if(label)url.searchParams.set("q",label);
    return url.toString();
  }
  // Topo GPS dokumenterar mottagning av platslänkar, men inte något publikt
  // format för att skapa en koordinatlänk. Gissa därför inte ett URL-format.
  function buildTopoGpsUrl(){return null;}
  const api={coordinates,buildGoogleMapsUrl,buildAppleMapsUrl,buildTopoGpsUrl};
  root.VK_NAVIGATION=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
