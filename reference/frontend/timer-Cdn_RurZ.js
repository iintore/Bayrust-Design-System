
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a6767216-2a5e-5952-8789-4325c8fd4ca4")}catch(e){}}();
async function e(e){await new Promise(t=>setTimeout(t,e))}function t(){return new Promise(e=>{let t=globalThis.setImmediate;t?t(e):setTimeout(e,0)})}var n=class extends Error{code=`ETIMEDOUT`;constructor(e,t){super(`Operation ${e} timed out after ${t} ms`),this.name=`TimeoutError`}};async function r(e,t,r){let i;try{return await Promise.race([e,new Promise((e,a)=>{i=setTimeout(()=>a(new n(r,t)),t)})])}finally{i!==void 0&&clearTimeout(i)}}export{t as i,e as n,r,n as t};
//# sourceMappingURL=timer-Cdn_RurZ.js.map
//# debugId=a6767216-2a5e-5952-8789-4325c8fd4ca4
