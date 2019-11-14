var sha256 = require("js-sha256")

var ECDSAMath = require("./math")
var Signature = require("./signature")
var BinaryAscii = require("./utils/binary")
var RandomInteger = require("./utils/integer")


exports.sign = function (message, privateKey, hashfunc=sha256) {
    hashMessage = hashfunc(message)
    numberMessage = BinaryAscii.numberFromString(hashMessage)
    curve = privateKey.curve
    randNum = RandomInteger.between(1, curve.N - 1)
    randSignPoint = ECDSAMath.multiply(curve.G, n=randNum, A=curve.A, P=curve.P, N=curve.N)
    r = randSignPoint.x % curve.N
    s = ((numberMessage + r * privateKey.secret) * (ECDSAMath.inv(randNum, curve.N))) % curve.N
    return Signature(r, s)
}


exports.verify = function (message, signature, publicKey, hashfunc=sha256) {
    hashMessage = hashfunc(message)
    numberMessage = BinaryAscii.numberFromString(hashMessage)
    curve = publicKey.curve
    sigR = signature.r
    sigS = signature.s
    inv = ECDSAMath.inv(sigS, curve.N)
    u1 = ECDSAMath.multiply(curve.G, n=(numberMessage * inv) % curve.N, A=curve.A, P=curve.P, N=curve.N)
    u2 = ECDSAMath.multiply(publicKey.point, n=(sigR * inv) % curve.N, A=curve.A, P=curve.P, N=curve.N)
    add = ECDSAMath.add(u1, u2, P=curve.P, A=curve.A)
    return sigR == add.x
}
