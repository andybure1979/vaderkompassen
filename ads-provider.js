(function(root){
  "use strict";

  const PLACEMENTS=Object.freeze(["main_bottom_banner","ranking_inline_native"]);
  const PREMIUM_ROLES=new Set(["trial","trialing","premium","active","cancelled_active","grace_period","vip","admin"]);
  const safeError=error=>({code:String(error?.code??"unknown").slice(0,40),message:String(error?.message||"Annonsfel").slice(0,120)});
  const hideElement=element=>element?.classList.add("hidden");

  function accessAllowsAds(access={}){
    if(!access?.resolved||access?.premium||access?.admin)return false;
    return !PREMIUM_ROLES.has(String(access?.role||"free").toLowerCase());
  }

  class AdProvider{
    constructor(config={}){this.config=config;this.status={provider:"none",initialized:false,consent:"unavailable/error",canRequestAds:false,banner:"idle",native:"unsupported",lastError:null}}
    async initialize(){}
    async requestConsent(){return this.status}
    canRequestAds(){return false}
    async showBanner(_placement,element){hideElement(element)}
    async hideBanner(_placement,element){hideElement(element)}
    async loadNativeAd(_placement,element){hideElement(element)}
    async destroyPlacement(_placement,element){hideElement(element)}
    async destroy(){}
    async showPrivacyOptions(){return false}
    getStatus(){return {...this.status}}
  }

  class NoAdsProvider extends AdProvider{
    constructor(config={}){super(config);this.status.provider="none"}
  }

  class WebPlaceholderAdProvider extends AdProvider{
    constructor(config={}){super(config);this.status={...this.status,provider:"web-placeholder",initialized:true,consent:"not_required",canRequestAds:true,native:"placeholder"}}
    canRequestAds(){return true}
    async showBanner(_placement,element){if(!element)return;element.textContent="Annons";element.classList.remove("hidden");this.status.banner="loaded"}
    async loadNativeAd(_placement,element){if(!element)return;element.textContent="Annons";element.classList.remove("hidden")}
  }

  class AdMobProvider extends AdProvider{
    constructor(config={}){
      super(config);
      this.status.provider="admob";
      this.plugin=root.Capacitor?.Plugins?.AdMob||null;
      this.platform=root.Capacitor?.getPlatform?.()||"unknown";
      this.initializing=null;
      this.bannerVisible=false;
      this.generation=0;
    }
    platformConfig(){return this.config?.[this.platform]||{}}
    configured(){
      const unit=this.platformConfig()?.placements?.main_bottom_banner;
      return Boolean(this.config?.enabled&&["test","production"].includes(this.config?.mode)&&unit);
    }
    async initialize(){
      if(this.status.initialized)return;
      if(this.initializing)return this.initializing;
      if(!this.plugin||!this.configured())throw new Error("AdMob är inte konfigurerat för denna miljö");
      this.initializing=(async()=>{
        const consent=await this.requestConsent();
        if(!consent.canRequestAds)throw new Error("CMP tillåter inte annonsbegäran");
        await this.plugin.initialize({initializeForTesting:this.config.mode==="test"});
        this.status.initialized=true;
      })().catch(error=>{this.status.lastError=safeError(error);throw error}).finally(()=>{this.initializing=null});
      return this.initializing;
    }
    async requestConsent(){
      if(!this.plugin){this.status.lastError={code:"plugin_missing",message:"AdMob-plugin saknas"};return this.getStatus()}
      try{
        const options={tagForUnderAgeOfConsent:false};
        if(this.config.mode==="test"&&this.config.consentDebugGeography)options.debugGeography=this.config.consentDebugGeography;
        let info=await this.plugin.requestConsentInfo(options);
        if(info?.status==="REQUIRED"&&info?.isConsentFormAvailable)info=await this.plugin.showConsentForm();
        this.status.consent=info?.status==="OBTAINED"?"obtained":info?.status==="NOT_REQUIRED"?"not_required":info?.status==="REQUIRED"?"required_not_obtained":"unavailable/error";
        this.status.canRequestAds=Boolean(info?.canRequestAds);
        this.status.privacyOptionsRequired=info?.privacyOptionsRequirementStatus==="REQUIRED";
        return this.getStatus();
      }catch(error){
        this.status.consent="unavailable/error";this.status.canRequestAds=false;this.status.lastError=safeError(error);
        return this.getStatus();
      }
    }
    canRequestAds(){return Boolean(this.status.canRequestAds)}
    async showBanner(placement,element){
      if(placement!=="main_bottom_banner"||this.bannerVisible)return;
      hideElement(element);
      const generation=++this.generation;
      try{
        await this.initialize();
        if(generation!==this.generation)return;
        const adId=this.platformConfig().placements.main_bottom_banner;
        // UMP:s sparade IAB-/privacy-signaler är sanningskälla för personalisering.
        // En egen npa-boolean kan inte korrekt skilja ett godkännande från ett avslag.
        await this.plugin.showBanner({adId,adSize:"ADAPTIVE_BANNER",position:"BOTTOM_CENTER",margin:0,isTesting:this.config.mode==="test"});
        if(generation!==this.generation){await this.plugin.removeBanner();return}
        this.bannerVisible=true;this.status.banner="loaded";
      }catch(error){
        this.status.banner="failed";this.status.lastError=safeError(error);hideElement(element);
      }
    }
    async hideBanner(_placement,element){
      this.generation++;hideElement(element);
      if(this.bannerVisible&&this.plugin){try{await this.plugin.hideBanner()}catch{}this.bannerVisible=false}
    }
    async loadNativeAd(_placement,element){hideElement(element);this.status.native="unsupported"}
    async destroyPlacement(placement,element){
      this.generation++;hideElement(element);
      if(placement==="main_bottom_banner"&&this.plugin){try{await this.plugin.removeBanner()}catch{}this.bannerVisible=false;this.status.banner="idle"}
    }
    async destroy(){await this.destroyPlacement("main_bottom_banner");this.status.initialized=false}
    async showPrivacyOptions(){
      if(!this.plugin||!this.status.privacyOptionsRequired)return false;
      try{await this.plugin.showPrivacyOptionsForm();await this.requestConsent();return true}catch(error){this.status.lastError=safeError(error);return false}
    }
  }

  class AdsController{
    constructor(config={}){this.config=config;this.access={resolved:false};this.provider=new NoAdsProvider(config);this.elements=new Map();this.generation=0}
    desiredProvider(){
      if(!accessAllowsAds(this.access))return NoAdsProvider;
      if(root.VK_NATIVE?.isNativePlatform?.())return AdMobProvider;
      return this.config.mode==="placeholder"?WebPlaceholderAdProvider:NoAdsProvider;
    }
    async setAccess(access={}){
      this.access={...access,resolved:Boolean(access.resolved)};
      const generation=++this.generation,Provider=this.desiredProvider();
      if(!(this.provider instanceof Provider)){await this.provider.destroy();this.provider=new Provider(this.config)}
      if(generation!==this.generation)return;
      if(!accessAllowsAds(this.access)){for(const element of this.elements.values())hideElement(element);return}
      await this.refresh();
    }
    async refresh(){
      if(!accessAllowsAds(this.access))return;
      const banner=this.elements.get("main_bottom_banner");
      if(banner)await this.provider.showBanner("main_bottom_banner",banner);
      const native=this.elements.get("ranking_inline_native");
      if(native)await this.provider.loadNativeAd("ranking_inline_native",native);
    }
    async showBanner(placement,element){this.elements.set(placement,element);if(accessAllowsAds(this.access))await this.provider.showBanner(placement,element);else hideElement(element)}
    async loadNativeAd(placement,element){this.elements.set(placement,element);if(accessAllowsAds(this.access))await this.provider.loadNativeAd(placement,element);else hideElement(element)}
    async destroyPlacement(placement,element=this.elements.get(placement)){this.elements.delete(placement);await this.provider.destroyPlacement(placement,element)}
    async showPrivacyOptions(){return this.provider.showPrivacyOptions()}
    getStatus(){return {...this.provider.getStatus(),adsAllowed:accessAllowsAds(this.access),mode:this.config.mode,platform:root.Capacitor?.getPlatform?.()||"web"}}
  }

  function createController(config={}){return new AdsController(config)}
  root.VK_ADS=Object.freeze({PLACEMENTS,accessAllowsAds,AdProvider,NoAdsProvider,WebPlaceholderAdProvider,AdMobProvider,AdsController,createController});
})(globalThis);
