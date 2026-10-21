
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="7657b133-7424-5eb8-bb38-d487dc784136")}catch(e){}}();
var e=`AI has been disabled by one of your organizations`,t=new Set([`ai-chat`,`quick-ai`,`ai-commands`,`ai-modes`]);function n(e){return e?.any_organization_has_ai_disabled===!0?`organization-disabled`:`allowed`}function r(e){return n(e)===`allowed`}function i(e){return e?.has_pro_features===!0||e?.has_better_ai===!0}function a(e){return t.has(e)}export{a as i,r as n,i as r,e as t};
//# sourceMappingURL=ai-access-3NQJtIKu.js.map
//# debugId=7657b133-7424-5eb8-bb38-d487dc784136
