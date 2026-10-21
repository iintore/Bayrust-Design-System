
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="27f2b88c-bbf2-5291-a62a-6fff497af96f")}catch(e){}}();
import{o as e}from"./chunk-CMxvf4Kt.js";import{n as t}from"./time-BgPLLP_H.js";import{n}from"./key-down-handler-83o4rabr.js";var r=e(t(),1);function i(e={}){let{capture:t=!0}=e;r.useEffect(()=>{let e=e=>{if(e.defaultPrevented)return;let t=new KeyboardEvent(n,e);Object.defineProperty(t,"originalTarget",{value:e.target,writable:!1,enumerable:!0,configurable:!0}),document.dispatchEvent(t)||(e.preventDefault(),e.stopPropagation())};return document.addEventListener(`keydown`,e,{capture:t}),()=>{document.removeEventListener(`keydown`,e,{capture:t})}},[t])}export{i as t};
//# sourceMappingURL=use-key-down-catcher-CqdTQeZL.js.map
//# debugId=27f2b88c-bbf2-5291-a62a-6fff497af96f
