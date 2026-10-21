
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="3223c5f0-7afd-5bbc-a481-743c977f3f3a")}catch(e){}}();
import{o as e}from"./chunk-CMxvf4Kt.js";import{n as t}from"./time-BgPLLP_H.js";import{E as n}from"./icon-CKbK2z_d.js";var r=e(t(),1),i=`raycast-keydown`;function a({handler:e}){let t=n(e);return r.useEffect(()=>{let e=e=>{if(t(e)===`handled`){e.stopImmediatePropagation();return}};return document.addEventListener(i,e),()=>{document.removeEventListener(i,e)}},[t]),null}a.displayName=`KeydownHandler`;export{i as n,a as t};
//# sourceMappingURL=key-down-handler-83o4rabr.js.map
//# debugId=3223c5f0-7afd-5bbc-a481-743c977f3f3a
