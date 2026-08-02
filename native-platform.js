(function(root){
  "use strict";
  const capacitor=root.Capacitor;
  const platform=capacitor?.getPlatform?.()||"web";
  const native=Boolean(capacitor?.isNativePlatform?.()||platform==="ios"||platform==="android");
  const plugins=capacitor?.Plugins||{};
  const plugin=name=>plugins[name]||null;
  const getRuntimePlatform=()=>platform;
  const isNativePlatform=()=>native;
  const isWebPlatform=()=>!native;
  const authRedirectUrl=()=>native?"vaderkompassen://auth/callback":new URL("./",root.location.href).href;
  const storage={
    async getItem(key){if(native&&plugin("Preferences")){const result=await plugin("Preferences").get({key});return result.value}return root.localStorage.getItem(key)},
    async setItem(key,value){if(native&&plugin("Preferences"))return plugin("Preferences").set({key,value});root.localStorage.setItem(key,value)},
    async removeItem(key){if(native&&plugin("Preferences"))return plugin("Preferences").remove({key});root.localStorage.removeItem(key)}
  };
  async function openExternal(url){
    const target=String(url||"");if(!/^https:\/\//i.test(target))throw new Error("Endast säkra HTTPS-länkar tillåts.");
    if(native){root.open(target,"_system","noopener,noreferrer");return true}
    root.open(target,"_blank","noopener,noreferrer");return true;
  }
  async function openAuth(url){
    if(native&&plugin("Browser"))return plugin("Browser").open({url,presentationStyle:"popover"});
    root.location.assign(url);
  }
  async function closeAuth(){if(native&&plugin("Browser")){try{await plugin("Browser").close()}catch{}}}
  async function purchase(method,args={}){
    const bridge=plugin("VaderkompassenPurchases");
    if(!native||!bridge?.[method])throw new Error("Butiksköp är förberedda men ännu inte aktiverade.");
    return bridge[method](args);
  }
  async function initialize(){
    if(!native)return;
    try{await plugin("StatusBar")?.setStyle?.({style:"DARK"})}catch{}
    try{await plugin("SplashScreen")?.hide?.()}catch{}
    const app=plugin("App"),network=plugin("Network");
    await app?.addListener?.("appStateChange",state=>root.dispatchEvent(new CustomEvent("vk:native-app-state",{detail:state})));
    await app?.addListener?.("appUrlOpen",async event=>{await closeAuth();root.dispatchEvent(new CustomEvent("vk:native-url-open",{detail:{url:event.url}}))});
    const launch=await app?.getLaunchUrl?.();if(launch?.url)root.dispatchEvent(new CustomEvent("vk:native-url-open",{detail:{url:launch.url}}));
    await network?.addListener?.("networkStatusChange",status=>root.dispatchEvent(new CustomEvent("vk:native-network",{detail:status})));
  }
  const api=Object.freeze({getRuntimePlatform,isNativePlatform,isWebPlatform,authRedirectUrl,storage,openExternal,openAuth,closeAuth,purchase,initialize});
  root.VK_NATIVE=api;
  root.addEventListener("DOMContentLoaded",()=>initialize().catch(error=>{if(root.VK_CONFIG?.debug)console.warn("Native init",error)}),{once:true});
})(globalThis);
