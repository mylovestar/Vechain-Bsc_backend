"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./utils/logger"));
const minter_route_1 = require("./routes/minter.route");
dotenv_1.default.config({
    path: ".env",
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(minter_route_1.router);
const port = process.env.PORT || 5000;
//https://mvgbridge.com/
app.listen(port, () => {
    logger_1.default.info(`Server started on port ${port}`);
});
//# sourceMappingURL=server.js.map