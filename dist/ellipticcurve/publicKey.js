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
exports.PublicKey = void 0;
const BinaryAscii = __importStar(require("./utils/binary"));
const EcdsaCurve = __importStar(require("./curve"));
const point_1 = require("./point");
const der = __importStar(require("./utils/der"));
const Math = __importStar(require("./math"));
class PublicKey {
    constructor(point, curve) {
        this.point = point;
        this.curve = curve;
    }
    toString(encoded = false) {
        let xString = BinaryAscii.stringFromNumber(this.point.x, this.curve.length());
        let yString = BinaryAscii.stringFromNumber(this.point.y, this.curve.length());
        if (encoded) {
            return Buffer.concat([
                Buffer.from([0x00, 0x04]),
                Buffer.from(xString, "binary"),
                Buffer.from(yString, "binary"),
            ]);
        }
        return Buffer.concat([
            Buffer.from(xString, "binary"),
            Buffer.from(yString, "binary"),
        ]);
    }
    toDer() {
        const ecOid = der.encodeOid([1, 2, 840, 10045, 2, 1]);
        const curveOid = der.encodeOid(this.curve.oid);
        const encodeEcAndOid = der.encodeSequence(ecOid, curveOid);
        const encodedPoint = der.encodeBitstring(this.toString(true));
        return der.encodeSequence(encodeEcAndOid, encodedPoint);
    }
    toPem() {
        return der.toPem(this.toDer(), "PUBLIC KEY");
    }
    static fromPem(string) {
        return this.fromDer(der.fromPem(string));
    }
    static fromDer(data) {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
        let [s1, empty] = der.removeSequence(buf);
        if (empty.length > 0) {
            throw new Error("trailing junk after DER public key: " +
                BinaryAscii.hexFromBinary(empty));
        }
        let [s2, pointBitString] = der.removeSequence(s1);
        let [, rest] = der.removeObject(s2);
        let [oidCurve, empty2] = der.removeObject(rest);
        if (empty2.length > 0) {
            throw new Error("trailing junk after DER public key objects: " +
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
        let [pointStr, empty3] = der.removeBitString(pointBitString);
        if (empty3.length > 0) {
            throw new Error("trailing junk after public key point-string: " +
                BinaryAscii.hexFromBinary(empty3));
        }
        return this.fromString(pointStr.slice(2), curve);
    }
    static fromString(data, curve = EcdsaCurve.secp256k1, validatePoint = true) {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
        let baseLen = curve.length();
        let xs = buf.slice(0, baseLen);
        let ys = buf.slice(baseLen);
        let p = new point_1.Point(BinaryAscii.numberFromString(xs.toString("binary")), BinaryAscii.numberFromString(ys.toString("binary")));
        let publicKey = new PublicKey(p, curve);
        if (!validatePoint) {
            return publicKey;
        }
        if (p.isAtInfinity()) {
            throw new Error("Public Key point is at infinity");
        }
        if (!curve.contains(p)) {
            throw new Error(`point (${p.x},${p.y}) is not valid for curve ${curve.name}`);
        }
        if (!Math.multiply(p, curve.N, curve.N, curve.A, curve.P).isAtInfinity()) {
            throw new Error(`Point (${p.x},${p.y} * ${curve.name}.N is not at infinity`);
        }
        return publicKey;
    }
}
exports.PublicKey = PublicKey;
