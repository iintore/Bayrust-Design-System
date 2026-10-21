
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="db3731a1-c4b8-544d-a5dd-2a4e64bd87b1")}catch(e){}}();
var e=class{_queues;constructor(e=new Map){this._queues=e}run(e,t){let n=(this._queues.get(e)??Promise.resolve()).then(t),r=n.then(()=>void 0,()=>void 0);return this._queues.set(e,r),r.finally(()=>{this._queues.get(e)===r&&this._queues.delete(e)}),n}};export{e as t};
//# sourceMappingURL=keyed-serial-queue-Bn7FK1Vt.js.map
//# debugId=db3731a1-c4b8-544d-a5dd-2a4e64bd87b1
