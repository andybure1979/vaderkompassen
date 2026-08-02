(function(root){
  "use strict";
  const PLACEMENTS=Object.freeze(["main_bottom_banner","ranking_inline_native"]);
  class AdProvider{show(element){element?.classList.add("hidden")}destroy(element){element?.classList.add("hidden")}}
  class NoAdsProvider extends AdProvider{}
  class WebPlaceholderAdProvider extends AdProvider{show(element){if(!element)return;element.textContent="Annons";element.classList.remove("hidden")}}
  class AdMobProvider extends AdProvider{
    constructor(config={}){super();this.config=config;this.active=false}
    show(element){
      // Ingen native AdMob-plugin eller produktionsannons initieras i v14.4.0.
      if(this.config.environment!=="production"&&this.config.adsMode==="test"){
        element.textContent="Testannons";element.classList.remove("hidden");return;
      }
      super.show(element);
    }
  }
  function createProvider(config={},premium=false){
    if(premium)return new NoAdsProvider();
    if(root.VK_NATIVE?.isNativePlatform?.())return new AdMobProvider(config);
    return new WebPlaceholderAdProvider();
  }
  root.VK_ADS=Object.freeze({PLACEMENTS,AdProvider,NoAdsProvider,WebPlaceholderAdProvider,AdMobProvider,createProvider});
})(globalThis);
