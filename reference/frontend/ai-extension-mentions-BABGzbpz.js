
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="7f529418-59b2-56b4-8b31-6f3b9384fe06")}catch(e){}}();
import"./attachments-hQImwAZk.js";function e(e){if(e===`qualified-v1`||e===`qualified-v2`)return e}function t(t){if(t)try{let n=JSON.parse(t);if(typeof n==`object`&&n&&`mentionFormat`in n)return e(n.mentionFormat)}catch{}}var n=`[\\w-]+`,r=`[^}\\s]+`,i=`@(?!skill:)(${n})\\{id=(${r})\\}`;`${n}${r}`;function a(e,t){return`@${e}{id=${t}}`}function o(e){if(e&&/^(?:builtin_package_|remote_package_|mcp_server_|node_package_)[^}\s]+$/u.test(e))return e}function s(e){return e.replace(new RegExp(i,`gi`),`@$1`)}export{t as i,s as n,o as r,a as t};
//# sourceMappingURL=ai-extension-mentions-BABGzbpz.js.map
//# debugId=7f529418-59b2-56b4-8b31-6f3b9384fe06
