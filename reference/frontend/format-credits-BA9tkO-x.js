
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="26f4b3a0-cd50-56b3-9f48-150c28734aec")}catch(e){}}();
var e=new Intl.NumberFormat(`en-US`,{maximumFractionDigits:0}),t=new Intl.NumberFormat(`en-US`,{style:`currency`,currency:`USD`});function n(t){return e.format(a(t))}function r(t){let n=a(t);return`${e.format(n)} ${n===1?`credit`:`credits`}`}function i(t){let n=Number.isFinite(t)?Math.max(0,t):0;if(n>0&&n<1)return`< 1 credit`;let r=Math.floor(n);return`${e.format(r)} ${r===1?`credit`:`credits`}`}function a(e){return Number.isFinite(e)?Math.max(0,Math.round(e)):0}export{t as i,r as n,i as r,n as t};
//# sourceMappingURL=format-credits-BA9tkO-x.js.map
//# debugId=26f4b3a0-cd50-56b3-9f48-150c28734aec
