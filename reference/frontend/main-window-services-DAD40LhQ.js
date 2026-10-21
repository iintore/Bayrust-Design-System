
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="cd6e5e9d-5ddb-5b48-9ca9-466c37e99602")}catch(e){}}();
import{n as e,t}from"./services-CI1JjB8Y.js";import{t as n}from"./ai-extension-R40i_hUJ.js";var r=new class extends e{get mainRouter(){return this.get(`mainRouter`)}get photon(){return this.get(`photon`)}get formDrafts(){return this.get(`formDrafts`)}get viewTti(){return this.get(`viewTti`)}configureAiCatalog(){t.aiCatalog.setAiExtensionPreferencesReader(()=>this.photon.settings.getInternalExtensionSettings(n.id).preferences)}};export{r as t};
//# sourceMappingURL=main-window-services-DAD40LhQ.js.map
//# debugId=cd6e5e9d-5ddb-5b48-9ca9-466c37e99602
