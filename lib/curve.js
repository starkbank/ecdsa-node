//
// Elliptic Curve Equation
//
// y^2 = x^3 + A*x + B (mod P)
//

var Point = require("./point").Point;


class CurveFp {
    constructor(A, B, P, N, Gx, Gy, name, oid, nistName=null) {
        this.A = A;
        this.B = B;
        this.P = P;
        this.N = N;
        this.G = new Point(Gx, Gy);
        this.name = name;
        this.nistName = nistName;
        this.oid = oid;

        this.contains = function (p) {
            return (p.y**2 - (p.x**3 + this.A * p.x + this.B)) % this.P == 0;
        };

        this.length = function () {
            return Math.floor((1 + this.N.toString().length) / 2);
        };
    };
};

exports.CurveFp = CurveFp;

let secp256k1 = new CurveFp(
    0x0000000000000000000000000000000000000000000000000000000000000000n,
    0x0000000000000000000000000000000000000000000000000000000000000007n,
    0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn,
    0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n,
    0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n,
    0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n,
    "secp256k1",
    [1, 3, 132, 0, 10],
);

let prime256v1 = new CurveFp(
    0xffffffff00000001000000000000000000000000fffffffffffffffffffffffcn,
    0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604bn,
    0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn,
    0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n,
    0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n,
    0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n,
    "prime256v1",
    [1, 2, 840, 10045, 3, 1, 7],
    "P-256",
);
let p256 = prime256v1;

let supportedCurves = [
    secp256k1,
    prime256v1,
];

let curvesByOid = {};
supportedCurves.forEach((curve) => {curvesByOid[curve.oid] = curve});

exports.curvesByOid = curvesByOid;
exports.secp256k1 = secp256k1
exports.prime256v1 = prime256v1
exports.p256 = p256
