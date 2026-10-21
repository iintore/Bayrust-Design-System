
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5e5babdd-e2bd-544a-ba22-bbc05f9d4251")}catch(e){}}();
function e(e,t,n){return e===1?t:n||`${t}s`}function t(e){try{let t=Intl.getCanonicalLocales(e)[0];if(t===void 0)return;let n=t.split(`-x-`,1)[0].match(/-u(?:-[a-z0-9]{2,8})*?-rg-([a-z]{2}|[0-9]{3})zzzz(?:-|$)/i)?.[1];return n?new Intl.Locale(t,{region:n}).toString():t}catch{return}}var n=new Set([`Adlm`,`Arab`,`Hebr`,`Mand`,`Mend`,`Nkoo`,`Rohg`,`Syrc`,`Thaa`]);function r(e){try{let t=new Intl.Locale(e);return(t.getTextInfo?.().direction??t.textInfo?.direction)||(n.has(t.maximize().script??``)?`rtl`:`ltr`)}catch{return`ltr`}}export{e as n,t as r,r as t};
//# sourceMappingURL=i18n-DfavOg8-.js.map
//# debugId=5e5babdd-e2bd-544a-ba22-bbc05f9d4251
