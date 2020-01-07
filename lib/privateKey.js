const PublicKey = require("./publicKey").PublicKey;
const RandomInteger = require("./utils/integer");
const BinaryAscii = require("./utils/binary");
const EcdsaCurve = require("./curve");
const EcdsaMath = require("./math");
const BigInt = require("big-integer");
const der = require("./utils/der");

const hexAt = "\x00";


class PrivateKey {
    constructor(curve=EcdsaCurve.secp256k1, secret=null) {
        this.curve = curve;
        if (secret) {
            this.secret = secret;
        } else {
            this.secret = RandomInteger.between(BigInt(1), curve.N.minus(1));
        }
    };

    publicKey () {
        let curve = this.curve;
        let publicPoint = EcdsaMath.multiply(curve.G, this.secret, curve.N, curve.A, curve.P);
        return new PublicKey(publicPoint, curve);
    };

    toString () {
        return BinaryAscii.stringFromNumber(this.secret, this.curve.length());
    };

    toDer () {
        let encodedPublicKey = this.publicKey().toString(true);

        return der.encodeSequence(
            der.encodeInteger(BigInt(1)),
            der.encodeOctetString(this.toString()),
            der.encodeConstructed(0, der.encodeOid(this.curve.oid)),
            der.encodeConstructed(1, der.encodeBitstring(encodedPublicKey))
        );
    }

    toPem () {
        return der.toPem(this.toDer(), "EC PRIVATE KEY");
    };

    static fromPem (string) {
        let privateKeyPem = string.split("-----BEGIN EC PRIVATE KEY-----")[1];
        return this.fromDer(der.fromPem(privateKeyPem));
    };

    static fromDer(string) {
        let result = der.removeSequence(string);
        let t = result[0];
        let empty = result[1];
        if (empty) {
            throw new Error("trailing junk after DER private key: " + BinaryAscii.hexFromBinary(empty));
        };

        result = der.removeInteger(t);
        let one = result[0];
        t = result[1];
        if (one != 1) {
            throw new Error("expected '1' at start of DER private key, got " + one);
        };

        result = der.removeOctetString(t);
        let privateKeyStr = result[0];
        t = result[1];

        result = der.removeConstructed(t);
        let tag = result[0];
        let curveOidStr = result[1];
        t = result[2];

        if (tag != 0) {
            throw new Error("expected tag 0 in DER private key, got " + tag);
        };

        result = der.removeObject(curveOidStr);
        let oidCurve = result[0];
        empty = result[1];

        if (empty) {
            throw new Error("trailing junk after DER private key curve_oid: " + BinaryAscii.hexFromBinary(empty));
        };

        let curve = EcdsaCurve.curvesByOid[oidCurve];

        if (!curve) {
            let supportedCurvesNames = [];
            EcdsaCurve.supportedCurves.forEach((x) => {supportedCurvesNames.push(x.name)})
            throw new Error(
                "Unknown curve with oid " + oidCurve
                + ". Only the following are available: " + supportedCurvesNames
            );
        };

        if (privateKeyStr.length < curve.length()) {
            privateKeyStr = hexAt.repeat(curve.length() - privateKeyStr.length) + privateKeyStr;
        };

        return this.fromString(privateKeyStr, curve);
    };

    static fromString (string, curve=EcdsaCurve.secp256k1) {
        return new PrivateKey(curve, BinaryAscii.numberFromString(string));
    };
};


exports.PrivateKey = PrivateKey;
