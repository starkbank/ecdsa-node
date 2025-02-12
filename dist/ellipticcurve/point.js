"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Point = void 0;
const big_integer_1 = __importDefault(require("big-integer"));
class Point {
    constructor(x = (0, big_integer_1.default)(0), y = (0, big_integer_1.default)(0), z = (0, big_integer_1.default)(0)) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    isAtInfinity() {
        return this.y.equals(0);
    }
}
exports.Point = Point;
