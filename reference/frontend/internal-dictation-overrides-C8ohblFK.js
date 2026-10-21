
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="d790b034-9051-5876-9e5b-f0063d49ba10")}catch(e){}}();
import{t as e}from"./local-storage-C_uFdbNF.js";var t=`internal-dictation-secondary-languages`,n=`internal-dictation-time-limit-seconds`;function r(e){return e.split(`,`).map(e=>e.trim()).filter(e=>e.length>0)}function i(e){return e.join(`,`)}function a(){let i=r(e.get(t,``)),a=Math.round(Number(e.get(n,``))*1e3);return{secondaryLanguages:i.length>0?i:void 0,timeLimitMs:Number.isSafeInteger(a)&&a>0?a:void 0}}export{i as a,r as i,n,a as r,t};
//# sourceMappingURL=internal-dictation-overrides-C8ohblFK.js.map
//# debugId=d790b034-9051-5876-9e5b-f0063d49ba10
