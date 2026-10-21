
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="2c299894-bebe-5a00-8fa7-a8d4113dd0b1")}catch(e){}}();
function e(e){return encodeURIComponent(e).replaceAll(`%`,`_`)}function t(t,n){return`settings-command-${e(t)}-${e(n)}`}function n({extensionId:t,preferenceName:n,commandId:r}){let i=r?`${e(r)}-`:``;return`settings-preference-${e(t)}-${i}${e(n)}`}export{n,t};
//# sourceMappingURL=settings-target-ids-DEnPk8RP.js.map
//# debugId=2c299894-bebe-5a00-8fa7-a8d4113dd0b1
