
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="690479c4-8c20-5778-a64c-3b89c3b7004d")}catch(e){}}();
import{a as e,i as t,s as n}from"./turn-projection-D22Kzzj1.js";import{n as r,r as i}from"./subagent-card.logic-PZy0kg7q.js";function a(a){let o=new Set,s=[];for(let c of a){if(c.kind!==`tool-call`)continue;let a=e(c);if(a===null||o.has(a))continue;o.add(a);let l=n(c),u=i(c);s.push({childRunId:a,label:r(c),...u===void 0?{}:{title:u},parentStatus:c.status,background:t(c),...l===null?{}:{worktreePath:l}})}return s}export{a as t};
//# sourceMappingURL=composer-subagent-status.logic-DbhzsZD1.js.map
//# debugId=690479c4-8c20-5778-a64c-3b89c3b7004d
