
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a8e00c62-cd61-5708-9e10-d88f2f22d1f0")}catch(e){}}();
import{v as e,y as t}from"./path-BXfGhDtM.js";function n(e){try{return new URL(e).toString()}catch{}let t=e.indexOf(`.`);if(t!==-1&&t!==e.length-1)try{return new URL(`https://`+e).toString()}catch{return}}function r(e){try{return new URL(e).hostname.replace(/^www\./,``)}catch{return e}}function i(n){let r=e(n),{displayPath:i,needsTruncation:a}=t(r);return{displayPath:i,fullPath:r,isTruncated:a}}function a(e,t){try{let n=new URL(e),r=`${n.hostname.replace(/^www\./,``)}${n.pathname+n.search}`;return t!=null&&r.length>t?`${r.slice(0,t)}…`:r}catch{return e}}export{n as i,a as n,r,i as t};
//# sourceMappingURL=url-D6l_qJVM.js.map
//# debugId=a8e00c62-cd61-5708-9e10-d88f2f22d1f0
