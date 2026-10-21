
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="95b35fba-4470-5f5f-ae25-3d6de4a30755")}catch(e){}}();
var e=`Dictation has been disabled by one of your organizations`,t=`Dictation is managed by your organization and cannot be used.`,n=class extends Error{constructor(){super(e),this.name=`DictationDisabledByOrganizationError`}};function r(e){return e?.any_organization_has_dictation_disabled===!0?`organization-disabled`:`allowed`}function i(e){return r(e)===`allowed`}export{i,e as n,n as r,t};
//# sourceMappingURL=dictation-access-C7yHU2Ex.js.map
//# debugId=95b35fba-4470-5f5f-ae25-3d6de4a30755
