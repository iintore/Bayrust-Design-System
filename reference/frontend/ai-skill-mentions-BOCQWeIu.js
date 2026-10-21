
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="15381928-aaae-51f7-8fe8-7e1f8a1488f6")}catch(e){}}();
var e=`@skill:`,t=`A-Za-z0-9_%:-`,n=`[${t}]+(?:[.!~*'()][${t}]+)*`,r=RegExp(`${e}(${n})`,`gi`);function i(t){return`${e}${encodeURIComponent(t).replace(/[.!~*'()]/g,e=>`%${e.charCodeAt(0).toString(16).toUpperCase()}`)}`}function a(e){let t=e.matchAll(r);return Array.from(t,e=>s(e[1])).filter(Boolean)}function o(){return RegExp(`${e}${n}`,`gi`)}function s(e){try{return decodeURIComponent(e)}catch{return e}}export{i as n,o as r,a as t};
//# sourceMappingURL=ai-skill-mentions-BOCQWeIu.js.map
//# debugId=15381928-aaae-51f7-8fe8-7e1f8a1488f6
