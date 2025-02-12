"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = decode;
exports.encode = encode;
function decode(string) {
    return Buffer.from(string, "base64");
}
function encode(data) {
    if (Buffer.isBuffer(data)) {
        return data.toString("base64");
    }
    return Buffer.from(data, "binary").toString("base64");
}
