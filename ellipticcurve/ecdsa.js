const sha256 = require("js-sha256");
const BigInt = require("big-integer");

const EcdsaMath = require("./math");
const Signature = require("./signature").Signature;
const BinaryAscii = require("./utils/binary");
const Integer = require("./utils/integer");
const randomInteger = Integer.between;
const modulo = Integer.modulo;

exports.EcdsaMath = EcdsaMath;
exports.Signature = Signature;
exports.BinaryAscii = BinaryAscii;
exports.Integer = Integer;

exports.sign = function (message, privateKey, hashfunc=sha256) {
    let hashMessage = hashfunc(message);
    let numberMessage = BinaryAscii.numberFromHex(hashMessage);
    let curve = privateKey.curve;
    let randNum = randomInteger(BigInt(1), curve.N.minus(1));
    let randSignPoint = EcdsaMath.multiply(curve.G, randNum, curve.N, curve.A, curve.P);
    let r = modulo(randSignPoint.x, curve.N);
    let s = modulo((numberMessage.add(r.multiply(privateKey.secret)).multiply(EcdsaMath.inv(randNum, curve.N))), curve.N);
    return new Signature(r, s);
};


exports.verify = function (message, signature, publicKey, hashfunc=sha256) {
    let hashMessage = hashfunc(message);
    let numberMessage = BinaryAscii.numberFromHex(hashMessage);
    let curve = publicKey.curve;
    let sigR = signature.r;
    let sigS = signature.s;
    let inv = EcdsaMath.inv(sigS, curve.N);
    let u1 = EcdsaMath.multiply(curve.G, modulo((numberMessage.multiply(inv)), curve.N), curve.N, curve.A, curve.P);
    let u2 = EcdsaMath.multiply(publicKey.point, modulo((sigR.multiply(inv)), curve.N), curve.N, curve.A, curve.P);
    let add = EcdsaMath.add(u1, u2, curve.A, curve.P);
    return sigR.eq(add.x);
};
