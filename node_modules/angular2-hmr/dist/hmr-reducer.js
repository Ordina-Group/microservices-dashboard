"use strict";
exports.hmrReducer = function (appReducer) { return function (state, _a) {
    var type = _a.type, payload = _a.payload;
    switch (type) {
        case 'HMR_SET_STATE': return payload;
        default: return appReducer(state, { type: type, payload: payload });
    }
}; };
//# sourceMappingURL=hmr-reducer.js.map