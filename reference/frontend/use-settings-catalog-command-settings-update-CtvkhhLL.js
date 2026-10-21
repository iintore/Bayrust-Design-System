
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="f5e33ba1-8c0c-5830-b951-50309153c161")}catch(e){}}();
import{o as e}from"./chunk-CMxvf4Kt.js";import{n as t}from"./time-BgPLLP_H.js";import{n}from"./hotkey-conflict-error-eZKfTZj_.js";import{w as r}from"./settings-ui.namespace-DAWDtWTB.js";var i=e(t(),1);function a(e){let{photon:t,mutations:a}=r.photonClient,{execute:o,isPending:s}=t.useMutation(a.updateInternalExtensionDynamicCommandSettings);return{update:i.useCallback(async(t,r)=>n(o,{id:e,update:t,overwriteHotkeyConflict:r?.overwriteHotkeyConflict}),[e,o]),isUpdating:s}}export{a as t};
//# sourceMappingURL=use-settings-catalog-command-settings-update-CtvkhhLL.js.map
//# debugId=f5e33ba1-8c0c-5830-b951-50309153c161
