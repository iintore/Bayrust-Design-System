
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="1bd1385d-7ab9-52c0-ae24-c77f7850a847")}catch(e){}}();
function e(e){let t=e.cloud_sync_v2_access;if(t){if(t.allowed===!0)return`allowed`;switch(t.reason){case`organization_disabled`:return`organization-disabled`;case`requires_pro`:return`pro-required`;default:return`unavailable`}}return e.any_organization_has_cloud_sync_disabled===!0?`organization-disabled`:e.has_pro_features===!0?`allowed`:`pro-required`}function t(t){return t?e(t):`pro-required`}function n(e){return t(e)===`allowed`}export{n,t};
//# sourceMappingURL=cloud-sync-access-BbvEpT9i.js.map
//# debugId=1bd1385d-7ab9-52c0-ae24-c77f7850a847
