"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signature = void 0;
const BinaryAscii = __importStar(require("./utils/binary"));
const Base64 = __importStar(require("./utils/base"));
const der = __importStar(require("./utils/der"));
class Signature {
    constructor(r, s) {
        this.r = r;
        this.s = s;
    }
    toDer() {
        const rEncoded = der.encodeInteger(this.r);
        const sEncoded = der.encodeInteger(this.s);
        return der.encodeSequence(rEncoded, sEncoded);
    }
    toBase64() {
        return Base64.encode(this.toDer());
    }
    static fromDer(data) {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
        let [rs, empty] = der.removeSequence(buf);
        if (empty.length > 0) {
            throw new Error("trailing junk after DER signature: " + BinaryAscii.hexFromBinary(empty));
        }
        let [r, rest] = der.removeInteger(rs);
        let [s, empty2] = der.removeInteger(rest);
        if (empty2.length > 0) {
            throw new Error("trailing junk after DER numbers: " + BinaryAscii.hexFromBinary(empty2));
        }
        return new Signature(r, s);
    }
    static fromBase64(string) {
        let derString = Base64.decode(string);
        return this.fromDer(derString);
    }
}
exports.Signature = Signature;
