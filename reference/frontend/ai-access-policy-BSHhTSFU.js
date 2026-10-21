
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="e9415e3b-31fa-5c06-a073-3ab95a1b265f")}catch(e){}}();
import{t as e}from"./services-CI1JjB8Y.js";import{a as t}from"./toast-store-yMR5z_cG.js";var n=`AI has been disabled by one of your organizations`,r=`AI features are managed by your organization and cannot be used.`;function i(){t.open({variant:`failure`,title:n,message:r})}function a(){let t=e.authStore.peek();return t.isLoaded?t.user?.any_organization_has_ai_disabled===!0?(i(),!1):!0:!1}export{i as n,a as t};
//# sourceMappingURL=ai-access-policy-BSHhTSFU.js.map
//# debugId=e9415e3b-31fa-5c06-a073-3ab95a1b265f
