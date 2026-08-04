(function(root){
  "use strict";
  const environment=root.VK_ENVIRONMENT||{},mode=environment.adsMode||"disabled";
  const platform=name=>Object.freeze({
    appId:environment.ads?.[name]?.appId||"",
    placements:Object.freeze({
      main_bottom_banner:environment.ads?.[name]?.placements?.main_bottom_banner||"",
      ranking_inline_native:environment.ads?.[name]?.placements?.ranking_inline_native||""
    })
  });
  root.ADS_CONFIG=Object.freeze({
    enabled:Boolean(environment.adsEnabled)&&["test","production"].includes(mode),
    mode,
    consentDebugGeography:mode==="test"?(environment.adsConsentDebugGeography||"EEA"):undefined,
    ios:platform("ios"),
    android:platform("android")
  });
})(globalThis);
