
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="df3f19aa-ee67-5df1-94ae-5e69c7adf769")}catch(e){}}();
var e=365.2425,t=6048e5,n=864e5,r=6e4,i=36e5,a=43200,o=1440,s=3600*24;s*7,s*e/12*3;var c=Symbol.for(`constructDateFrom`);function l(e,t){return typeof e==`function`?e(t):e&&typeof e==`object`&&c in e?e[c](t):e instanceof Date?new e.constructor(t):new Date(t)}function u(e,t){return l(t||e,e)}function d(e,t){let n=u(e,t?.in);return n.setHours(0,0,0,0),n}export{i as a,o as c,n as i,a as l,u as n,r as o,l as r,t as s,d as t};
//# sourceMappingURL=startOfDay-DrIqsFn5.js.map
//# debugId=df3f19aa-ee67-5df1-94ae-5e69c7adf769
