
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="43861077-d0a0-5d4f-b7f7-212e79bcc28b")}catch(e){}}();
import{o as e}from"./text-BMG-lb-T.js";import{o as t}from"./turn-projection-D22Kzzj1.js";function n(n){let r=t(n);if(r!==null)return r.name;if(n.kind===`tool-call`&&typeof n.input==`object`&&n.input!==null){let t=n.input,r=t.subagent_type??t.type;if(typeof r==`string`&&r.length>0)return e(r)}return`Subagent`}function r(e){if(e.kind!==`tool-call`||typeof e.input!=`object`||e.input===null)return;let t=e.input.description;return typeof t==`string`&&t.trim().length>0?t.trim():void 0}function i(e){return t(e)?.icon}export{n,r,i as t};
//# sourceMappingURL=subagent-card.logic-PZy0kg7q.js.map
//# debugId=43861077-d0a0-5d4f-b7f7-212e79bcc28b
