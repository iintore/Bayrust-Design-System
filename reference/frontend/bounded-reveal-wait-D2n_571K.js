
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="f0855476-869a-523b-a8a8-962055265548")}catch(e){}}();
import{n as e}from"./logger-DNVmeXhU.js";var t=1e3;async function n(n,r,i=t){if(!n)return;let a,o=await Promise.race([n.then(()=>!1,()=>!1),new Promise(e=>{a=setTimeout(()=>e(!0),i)})]);clearTimeout(a),o&&e.warn(`startup`,r,{submit:`never`})}export{n as t};
//# sourceMappingURL=bounded-reveal-wait-D2n_571K.js.map
//# debugId=f0855476-869a-523b-a8a8-962055265548
