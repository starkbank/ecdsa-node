var sha256 = require("js-sha256");

var EcdsaMath = require("./math");
var Signature = require("./signature").Signature;
var BinaryAscii = require("./utils/binary");
var Integer = require("./utils/integer");
var randomInteger = Integer.between;
var modulo = Integer.modulo;


exports.sign = function (message, privateKey, hashfunc=sha256) {
    let hashMessage = hashfunc(message);
    let numberMessage = BinaryAscii.numberFromString(hashMessage);
    let curve = privateKey.curve;
    let randNum = randomInteger(1n, curve.N - 1n);
    let randSignPoint = EcdsaMath.multiply(curve.G, randNum, curve.N, curve.A, curve.P);
    let r = modulo(randSignPoint.x, curve.N);
    let s = modulo(((numberMessage + r * privateKey.secret) * (EcdsaMath.inv(randNum, curve.N))), curve.N);
    return new Signature(r, s);
};


exports.verify = function (message, signature, publicKey, hashfunc=sha256) {
    let hashMessage = hashfunc(message);
    let numberMessage = BinaryAscii.numberFromString(hashMessage);
    let curve = publicKey.curve;
    let sigR = signature.r;
    let sigS = signature.s;
    let inv = EcdsaMath.inv(sigS, curve.N);
    let u1 = EcdsaMath.multiply(curve.G, modulo((numberMessage * inv), curve.N), curve.N, curve.A, curve.P);
    let u2 = EcdsaMath.multiply(publicKey.point, modulo((sigR * inv), curve.N), curve.N, curve.A, curve.P);
    let add = EcdsaMath.add(u1, u2, curve.A, curve.P);
    return sigR === add.x;
};
