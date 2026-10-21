
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="1338d2ad-0ddf-5052-a313-adcd9196b28f")}catch(e){}}();
import{n as e}from"./hud-store-D8l7mVGu.js";import{t}from"./services-CI1JjB8Y.js";function n(t={}){let{title:n=`Copied to clipboard`,message:r,icon:i=`copy-clipboard`}=t;e.open({variant:`success`,title:n,message:r,icon:i})}async function r({text:e,feedbackTitle:r,feedbackMessage:i,feedbackIcon:a}){await Promise.all([window.mainWindow?.close(),t.ipc.backend.clipboard.copy({text:e})]),n({title:r,message:i,icon:a})}export{n,r as t};
//# sourceMappingURL=clipboard-utils-BmX5iAB7.js.map
//# debugId=1338d2ad-0ddf-5052-a313-adcd9196b28f
