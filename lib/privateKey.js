var RandomInteger = require("./utils/integer");
var BinaryAscii = require("./utils/binary");
var der = require("./utils/der");
var EcdsaCurve = require("./curve");
var EcdsaMath = require("./math");
var PublicKey = require("./publicKey").PublicKey;

hexAt = "\x00";


class PrivateKey {
    constructor(curve=EcdsaCurve.secp256k1, secret=null) {
        this.curve = curve;
        if (secret) {
            this.secret = secret;
        } else {
            this.secret = RandomInteger.between(1n, curve.N - 1n);
        }
    };

    publicKey () {
        let curve = this.curve;
        let publicPoint = EcdsaMath.multiply(curve.G, this.secret, curve.N, curve.A, curve.P);
        return new PublicKey(publicPoint, curve);
    };

    toString () {
        return BinaryAscii.stringFromNumber(number=this.secret, length=this.curve.length());
    };

    toDer () {
        let encodedPublicKey = this.publicKey().toString(encoded=True);

        return der.encodeSequence(
            der.encodeInteger(1),
            der.encodeOctetString(this.toString()),
            der.encodeConstructed(0, der.encodeOid(this.curve.oid)),
            der.encodeConstructed(1, der.encodeBitstring(encodedPublicKey)),
        );
    }

    toPem () {
        return der.toPem(der=toBytes(this.toDer()), name="EC PRIVATE KEY");
    };

    fromPem (string) {
        let privateKeyPem = string.split("-----BEGIN EC PRIVATE KEY-----")[1];
        return this.fromDer(der.fromPem(privateKeyPem));
    };

    fromDer(string) {
        let result = der.removeSequence(string);
        let t = result[0];
        let empty = result[1];
        if (empty) {
            throw new Error("trailing junk after DER private key: " + BinaryAscii.hexFromBinary(empty));
        };

        result = removeInteger(t);
        let one = result[0];
        t = result[1];
        if (one != 1) {
            throw new Error("expected '1' at start of DER private key, got " + one);
        };

        result = removeOctetString(t);
        let privateKeyStr = result[0];
        t = result[0];

        result = removeConstructed(t);
        let tag = result[0];
        let curveOidStr = result[1];
        t = result[2];

        if (tag != 0) {
            throw new Error("expected tag 0 in DER private key, got " + tag);
        };

        result = removeObject(curveOidStr);
        let oidCurve = result[0];
        empty = result[1];

        if (empty) {
            throw new Error("trailing junk after DER private key curve_oid: " + BinaryAscii.hexFromBinary(empty));
        };

        curve = curvesByOid[oidCurve];
        if (!curve) {
            throw new Error("unknown curve with oid " + oidCurve + "; the following are registered: " + EcdsaCurve.supportedCurves.forEach((x) => {x.name}));
        };

        if (privateKeyStr.length < curve.length()) {
            privateKeyStr = hexAt.repeat(curve.lenght() - privateKeyStr.length) + privateKeyStr;
        };

        return this.fromString(privateKeyStr, curve);
    };

    fromString (string, curve=EcdsaCurve.secp256k1) {
        return new PrivateKey(secret=BinaryAscii.numberFromString(string), curve=curve);
    };
};


exports.PrivateKey= PrivateKey;