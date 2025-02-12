"use strict";
//
// Elliptic Curve Equation
//
// y^2 = x^3 + A*x + B (mod P)
//
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.curvesByOid = exports.supportedCurves = exports.p256 = exports.prime256v1 = exports.secp256k1 = exports.CurveFp = void 0;
const big_integer_1 = __importDefault(require("big-integer"));
const point_1 = require("./point");
const integer_1 = require("./utils/integer");
class CurveFp {
    constructor(A, B, P, N, Gx, Gy, name, oid, nistName = null) {
        this.A = A;
        this.B = B;
        this.P = P;
        this.N = N;
        this.G = new point_1.Point(Gx, Gy);
        this.name = name;
        this.nistName = nistName;
        this._oid = oid;
    }
    contains(p) {
        if (p.x.lesser(0) || p.x.greater(this.P.minus(1))) {
            return false;
        }
        if (p.y.lesser(0) || p.y.greater(this.P.minus(1))) {
            return false;
        }
        if (!(0, integer_1.modulo)(p.y.pow(2).minus(p.x.pow(3).add(this.A.multiply(p.x)).add(this.B)), this.P).equals(0)) {
            return false;
        }
        return true;
    }
    length() {
        return Math.floor((1 + this.N.toString(16).length) / 2);
    }
    get oid() {
        return [...this._oid];
    }
}
exports.CurveFp = CurveFp;
exports.secp256k1 = new CurveFp((0, big_integer_1.default)("0000000000000000000000000000000000000000000000000000000000000000", 16), (0, big_integer_1.default)("0000000000000000000000000000000000000000000000000000000000000007", 16), (0, big_integer_1.default)("fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f", 16), (0, big_integer_1.default)("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 16), (0, big_integer_1.default)("79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798", 16), (0, big_integer_1.default)("483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8", 16), "secp256k1", [1, 3, 132, 0, 10]);
exports.prime256v1 = new CurveFp((0, big_integer_1.default)("ffffffff00000001000000000000000000000000fffffffffffffffffffffffc", 16), (0, big_integer_1.default)("5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b", 16), (0, big_integer_1.default)("ffffffff00000001000000000000000000000000ffffffffffffffffffffffff", 16), (0, big_integer_1.default)("ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551", 16), (0, big_integer_1.default)("6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296", 16), (0, big_integer_1.default)("4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5", 16), "prime256v1", [1, 2, 840, 10045, 3, 1, 7], "P-256");
exports.p256 = exports.prime256v1;
exports.supportedCurves = [exports.secp256k1, exports.prime256v1];
exports.curvesByOid = {};
exports.supportedCurves.forEach((curve) => {
    exports.curvesByOid[curve.oid.join(".")] = curve;
});
