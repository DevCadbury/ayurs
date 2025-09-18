"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = handler;
const index_1 = require("../src/index");
// Reuse the Express app across invocations
const app = (0, index_1.createApp)();
exports.config = {
    api: {
        bodyParser: false,
    },
};
// Export an Express-compatible handler for Vercel
function handler(req, res) {
    return app(req, res);
}
//# sourceMappingURL=index.js.map