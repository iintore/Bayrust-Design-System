
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="54eee8a9-b4f6-5c9b-bfdd-e3eada4a5473")}catch(e){}}();
import{o as e}from"./chunk-CMxvf4Kt.js";import{n as t}from"./time-BgPLLP_H.js";var n=e(t(),1);function r(e,t,r){let i=r?.enabled??!0,a=n.useRef(t);n.useLayoutEffect(()=>{a.current=t},[t]),n.useEffect(()=>{if(!i)return;let t=e.consume();return t&&a.current(t),e.subscribe(e=>a.current(e))},[e,i])}export{r as t};
//# sourceMappingURL=use-window-handoff-DPWDVFI1.js.map
//# debugId=54eee8a9-b4f6-5c9b-bfdd-e3eada4a5473
