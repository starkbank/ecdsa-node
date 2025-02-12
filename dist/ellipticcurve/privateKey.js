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
exports.PrivateKey = void 0;
const publicKey_1 = require("./publicKey");
const RandomInteger = __importStar(require("./utils/integer"));
const BinaryAscii = __importStar(require("./utils/binary"));
const EcdsaCurve = __importStar(require("./curve"));
const EcdsaMath = __importStar(require("./math"));
const big_integer_1 = __importDefault(require("big-integer"));
const der = __importStar(require("./utils/der"));
const hexAt = "\x00";
class PrivateKey {
    constructor(curve = EcdsaCurve.secp256k1, secret) {
        this.curve = curve;
        if (secret) {
            this.secret = secret;
        }
        else {
            this.secret = RandomInteger.between((0, big_integer_1.default)(1), curve.N.minus(1));
        }
    }
    publicKey() {
        let curve = this.curve;
        let publicPoint = EcdsaMath.multiply(curve.G, this.secret, curve.N, curve.A, curve.P);
        return new publicKey_1.PublicKey(publicPoint, curve);
    }
    toString() {
        return BinaryAscii.stringFromNumber(this.secret, this.curve.length());
    }
    toDer() {
        let encodedPublicKey = this.publicKey().toString(true);
        return der.encodeSequence(der.encodeInteger((0, big_integer_1.default)(1)), der.encodeOctetString(this.toString()), der.encodeConstructed(0, der.encodeOid(this.curve.oid)), der.encodeConstructed(1, der.encodeBitstring(encodedPublicKey)));
    }
    toPem() {
        return der.toPem(this.toDer(), "EC PRIVATE KEY");
    }
    static fromPem(string) {
        // Extract the private key part from the PEM file
        const privateKeyMatch = string.match(/-----BEGIN EC PRIVATE KEY-----\n([^-]+)\n-----END EC PRIVATE KEY-----/);
        if (!privateKeyMatch) {
            throw new Error("Invalid PEM format: EC PRIVATE KEY section not found");
        }
        const privateKeyPem = privateKeyMatch[1];
        return this.fromDer(Buffer.from(privateKeyPem, "base64"));
    }
    static fromDer(data) {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
        let [s1, empty] = der.removeSequence(buf);
        if (empty.length > 0) {
            throw new Error("trailing junk after DER private key: " +
                BinaryAscii.hexFromBinary(empty));
        }
        let [one, rest] = der.removeInteger(s1);
        if (!one.eq(1)) {
            throw new Error("expected '1' at start of DER private key, got " + one);
        }
        let [privateKeyStr, t1] = der.removeOctetString(rest);
        let [tag, curveOidStr, t2] = der.removeConstructed(t1);
        if (tag !== 0) {
            throw new Error("expected tag 0 in DER private key, got " + tag);
        }
        let [oidCurve, empty2] = der.removeObject(curveOidStr);
        if (empty2.length > 0) {
            throw new Error("trailing junk after DER private key curve_oid: " +
                BinaryAscii.hexFromBinary(empty2));
        }
        let curve = EcdsaCurve.curvesByOid[oidCurve.join(".")];
        if (!curve) {
            let supportedCurvesNames = EcdsaCurve.supportedCurves.map((x) => x.name);
            throw new Error("Unknown curve with oid " +
                oidCurve.join(".") +
                ". Only the following are available: " +
                supportedCurvesNames);
        }
        if (privateKeyStr.length < curve.length()) {
            privateKeyStr = Buffer.concat([
                Buffer.alloc(curve.length() - privateKeyStr.length, 0),
                privateKeyStr,
            ]);
        }
        return this.fromString(privateKeyStr, curve);
    }
    static fromString(data, curve = EcdsaCurve.secp256k1) {
        const str = Buffer.isBuffer(data) ? data.toString("binary") : data;
        return new PrivateKey(curve, BinaryAscii.numberFromString(str));
    }
}
exports.PrivateKey = PrivateKey;
