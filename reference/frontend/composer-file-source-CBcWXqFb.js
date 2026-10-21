
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="d3890d8b-a27a-53b7-aead-fef4e794c0c1")}catch(e){}}();
import{t as e}from"./services-CI1JjB8Y.js";import{n as t,t as n,v as r}from"./path-BXfGhDtM.js";import{t as i}from"./file-attachment-Bp3qkNDN.js";var a=5,o=3;async function s(s){let c=s.trim();return(await i(await e.indexStore.searchFiles({query:c,kind:c.length===0?`file`:void 0,limit:a*o}),a)).map(({path:e})=>({path:e,name:n(e),accessory:r(t(e))||void 0}))}export{s as searchComposerFiles};
//# sourceMappingURL=composer-file-source-CBcWXqFb.js.map
//# debugId=d3890d8b-a27a-53b7-aead-fef4e794c0c1
