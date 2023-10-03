"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const minter_controller_1 = require("../controllers/minter.controller");
exports.router = (0, express_1.Router)();
exports.router.post("/mint-eth", minter_controller_1.mintETH);
exports.router.post("/mint-bsc", minter_controller_1.mintBSC);
exports.router.post("/bridgebalance", minter_controller_1.BridgeBalance);
//# sourceMappingURL=minter.route.js.map