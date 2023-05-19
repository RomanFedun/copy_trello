"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorMessage = void 0;
const mongoose_1 = require("mongoose");
const getErrorMessage = (err) => {
    return err instanceof mongoose_1.Error ? err.message : String(err);
};
exports.getErrorMessage = getErrorMessage;
//# sourceMappingURL=helpers.js.map