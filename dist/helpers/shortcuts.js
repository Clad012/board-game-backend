"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resError = exports.resOK = void 0;
exports.resOK = (data) => (Object.assign({ error: false, message: '' }, data));
exports.resError = (message) => ({
    error: true,
    message,
});
//# sourceMappingURL=shortcuts.js.map