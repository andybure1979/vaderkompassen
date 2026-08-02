import type { CapacitorConfig } from "@capacitor/cli";

const environment=process.env.VK_ENVIRONMENT||"production";
const devServer=environment==="development"?process.env.VK_NATIVE_DEV_SERVER:undefined;
if(devServer&&!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(devServer))throw new Error("VK_NATIVE_DEV_SERVER måste vara en explicit lokal development-URL.");

const config:CapacitorConfig={
  appId:"se.vaderkompassen.app",
  appName:"Väderkompassen",
  webDir:"dist",
  server:{androidScheme:"https",iosScheme:"capacitor",allowNavigation:[],...(devServer?{url:devServer,cleartext:true}:{})},
  ios:{contentInset:"always",backgroundColor:"#f4f8fb",preferredContentMode:"mobile"},
  android:{allowMixedContent:false,backgroundColor:"#f4f8fb",webContentsDebuggingEnabled:environment!=="production"},
  plugins:{
    SplashScreen:{launchShowDuration:1200,launchAutoHide:true,backgroundColor:"#f4f8fb",showSpinner:false},
    StatusBar:{style:"DARK",backgroundColor:"#f4f8fb",overlaysWebView:false}
  }
};
export default config;
