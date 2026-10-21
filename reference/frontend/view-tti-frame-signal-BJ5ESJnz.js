
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="d7a0ef52-fff3-5e49-8a67-5c43802e7130")}catch(e){}}();
function e(){return`after-paint`}function t(){return 100}function n(e){let t=requestAnimationFrame(e);return()=>cancelAnimationFrame(t)}function r(e){let t=new MessageChannel,n=!1;return t.port1.onmessage=()=>{t.port1.close(),n||e()},t.port2.postMessage(void 0),()=>{n=!0}}function i(t=e()){let i=t===`after-paint`?r:n;return e=>{let t,r=n(()=>{t=i(e)});return()=>{r(),t?.()}}}export{t as n,i as t};
//# sourceMappingURL=view-tti-frame-signal-BJ5ESJnz.js.map
//# debugId=d7a0ef52-fff3-5e49-8a67-5c43802e7130
