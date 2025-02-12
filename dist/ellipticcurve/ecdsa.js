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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sign = sign;
exports.verify = verify;
const js_sha256_1 = require("js-sha256");
const big_integer_1 = __importDefault(require("big-integer"));
const EcdsaMath = __importStar(require("./math"));
const signature_1 = require("./signature");
const BinaryAscii = __importStar(require("./utils/binary"));
const Integer = __importStar(require("./utils/integer"));
const randomInteger = Integer.between;
const modulo = Integer.modulo;
function sign(message, privateKey, hashfunc = js_sha256_1.sha256, randNum) {
    let hashMessage = hashfunc(message);
    let numberMessage = BinaryAscii.numberFromHex(hashMessage);
    let curve = privateKey.curve;
    if (!randNum) {
        randNum = randomInteger((0, big_integer_1.default)(1), curve.N.minus(1));
    }
    let randSignPoint = EcdsaMath.multiply(curve.G, randNum, curve.N, curve.A, curve.P);
    let r = modulo(randSignPoint.x, curve.N);
    let s = modulo(numberMessage
        .add(r.multiply(privateKey.secret))
        .multiply(EcdsaMath.inv(randNum, curve.N)), curve.N);
    return new signature_1.Signature(r, s);
}
function verify(message, signature, publicKey, hashfunc = js_sha256_1.sha256) {
    let hashMessage = hashfunc(message);
    let numberMessage = BinaryAscii.numberFromHex(hashMessage);
    let curve = publicKey.curve;
    let sigR = signature.r;
    let sigS = signature.s;
    if (sigR.lesser(1) || sigR.greaterOrEquals(curve.N)) {
        return false;
    }
    if (sigS.lesser(1) || sigS.greaterOrEquals(curve.N)) {
        return false;
    }
    let inv = EcdsaMath.inv(sigS, curve.N);
    let u1 = EcdsaMath.multiply(curve.G, modulo(numberMessage.multiply(inv), curve.N), curve.N, curve.A, curve.P);
    let u2 = EcdsaMath.multiply(publicKey.point, modulo(sigR.multiply(inv), curve.N), curve.N, curve.A, curve.P);
    let v = EcdsaMath.add(u1, u2, curve.A, curve.P);
    if (v.isAtInfinity()) {
        return false;
    }
    return v.x.mod(curve.N).eq(sigR);
}
