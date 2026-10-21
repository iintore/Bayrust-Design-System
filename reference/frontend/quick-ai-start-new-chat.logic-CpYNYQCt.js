
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="91d3fc56-045a-5056-b40e-33263868eaec")}catch(e){}}();
var e={PT5M:5*6e4,PT10M:10*6e4,PT15M:15*6e4,PT30M:30*6e4,PT1H:60*6e4};function t(t){return e[t]}function n({durationUntilNewChat:e,state:n,now:r}){if(e===`never`)return!1;if(e===`always`)return!0;let i=Math.max(n.hiddenAt??0,n.lastSeenOpenAt??0);return i===0?!1:r-i>=t(e)}export{n as t};
//# sourceMappingURL=quick-ai-start-new-chat.logic-CpYNYQCt.js.map
//# debugId=91d3fc56-045a-5056-b40e-33263868eaec
