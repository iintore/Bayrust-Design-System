
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="8d6f1b23-08cf-530a-9de8-f77cd7377ecf")}catch(e){}}();
import{n as e,r as t}from"./startOfDay-DrIqsFn5.js";function n(n,r,i){let a=e(n,i?.in);if(isNaN(r))return t(i?.in||n,NaN);if(!r)return a;let o=a.getDate(),s=t(i?.in||n,a.getTime());return s.setMonth(a.getMonth()+r+1,0),o>=s.getDate()?s:(a.setFullYear(s.getFullYear(),s.getMonth(),o),a)}export{n as t};
//# sourceMappingURL=addMonths-D-5AOPVW.js.map
//# debugId=8d6f1b23-08cf-530a-9de8-f77cd7377ecf
