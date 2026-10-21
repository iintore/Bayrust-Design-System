
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="24505b06-9b49-552f-8fe4-8cdb48294ce5")}catch(e){}}();
var e=null;function t(t,n){e={text:t,send:n?.send??!1}}function n(){return e}function r(){let t=e;return e=null,t}var i=`raycast-ai-composer-action`,a=`raycast-ai-chat-action`,o=new Set;function s(e){let t=!1;for(let n of o)t=n(e)||t;return window.dispatchEvent(new CustomEvent(i,{detail:e})),t}function c(e){return o.add(e),()=>{o.delete(e)}}function l(e){window.dispatchEvent(new CustomEvent(a,{detail:e}))}export{r as a,c as i,l as n,n as o,s as r,t as s,a as t};
//# sourceMappingURL=external-chat-events-CvpX6l4P.js.map
//# debugId=24505b06-9b49-552f-8fe4-8cdb48294ce5
