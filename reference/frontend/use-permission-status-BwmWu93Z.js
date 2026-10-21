
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="aa7f53c6-9906-5ec9-865f-82b467668060")}catch(e){}}();
import{o as e}from"./chunk-CMxvf4Kt.js";import{n as t}from"./time-BgPLLP_H.js";import{E as n}from"./icon-CKbK2z_d.js";import{t as r}from"./services-CI1JjB8Y.js";var i=e(t(),1);function a(e){let[t,a]=i.useState(null),o=n(async()=>{let t=await r.ipc.host.permissions.checkPermission(e);return a(t),t});return i.useEffect(()=>{o();let e=()=>void o();return window.addEventListener(`focus`,e),()=>window.removeEventListener(`focus`,e)},[o]),{status:t,recheck:o}}export{a as t};
//# sourceMappingURL=use-permission-status-BwmWu93Z.js.map
//# debugId=aa7f53c6-9906-5ec9-865f-82b467668060
