const BinaryAscii = require("./utils/binary");
const EcdsaCurve = require("./curve");
const Point = require("./point").Point;
const der = require("./utils/der");
const Math = require("./math");
const { PrivateKey } = require("..");


class PublicKey {

    constructor (point, curve) {
        this.point = point;
        this.curve = curve;
    };

    toString (encoded=false) {
        let xString = BinaryAscii.stringFromNumber(this.point.x, this.curve.length());
        let yString = BinaryAscii.stringFromNumber(this.point.y, this.curve.length());
        if (encoded) {
            return "\x00\x04" + xString + yString;
        }
        return xString + yString;
    };

    toCompressed(encoded=false) {
        let baseLen = this.curve.length();

        if ((this.point.y["value"] % BigInt("2")).toString() == "0")
        {
            var parityTag = "02";
        } else {
            var parityTag = "03";
        }
        
        let xString = BinaryAscii.hexFromBinary(BinaryAscii.stringFromNumber(this.point.x, baseLen))
        return parityTag + xString
    }

    toDer () {
        let encodeEcAndOid = der.encodeSequence(der.encodeOid([1, 2, 840, 10045, 2, 1]), der.encodeOid(this.curve.oid));

        return der.encodeSequence(encodeEcAndOid, der.encodeBitstring(this.toString(true)))
    };

    toPem () {
        return der.toPem(this.toDer(), "PUBLIC KEY")
    };

    static fromPem (string) {
        return this.fromDer(der.fromPem(string));
    };

    static fromDer (string) {
        let result = der.removeSequence(string);
        let s1 = result[0];
        let empty = result[1];
        if (empty) {
            throw new Error("trailing junk after DER public key: " + BinaryAscii.hexFromBinary(empty));
        };

        result = der.removeSequence(s1);
        let s2 = result[0];
        let pointBitString = result[1];

        result = der.removeObject(s2);
        let rest = result[1];

        result = der.removeObject(rest);
        let oidCurve = result[0];
        empty = result[1];
        if (empty) {
            throw new Error("trailing junk after DER public key objects: " + BinaryAscii.hexFromBinary(empty));
        };

        let curve = EcdsaCurve.curvesByOid[oidCurve];
        if (!curve) {
            let supportedCurvesNames = [];
            EcdsaCurve.supportedCurves.forEach((x) => {supportedCurvesNames.push(x.name)})
            throw new Error(
                "Unknown curve with oid "
                + oidCurve
                + ". Only the following are available: "
                + supportedCurvesNames
            );
        };

        result = der.removeBitString(pointBitString);
        let pointStr = result[0];
        empty = result[1];
        if (empty) {
            throw new Error("trailing junk after public key point-string: " + BinaryAscii.hexFromBinary(empty));
        };

        return this.fromString(pointStr.slice(2), curve);
    };

    static fromString (string, curve=EcdsaCurve.secp256k1, validatePoint=true) {
        let baseLen = curve.length();

        let xs = string.slice(null, baseLen);
        let ys = string.slice(baseLen);

        let p = new Point(BinaryAscii.numberFromString(xs), BinaryAscii.numberFromString(ys));

        let publicKey = new PublicKey(p, curve);
        if (!validatePoint) {
            return publicKey;
        }
        if (p.isAtInfinity()) {
            throw new Error("Public Key point is at infinity");
        }
        if (!curve.contains(p)) {
            throw new Error("point (" + p.x + "," + p.y + ") is not valid for curve " + curve.name);
        }
        if (!Math.multiply(p, curve.N, curve.N, curve.A, curve.P).isAtInfinity()) {
            throw new Error("Point (" + p.x + "," + p.y + " * " + curve.name + ".N is not at infinity");
        }
        return publicKey
    };

    static fromCompressed(string, curve=EcdsaCurve.secp256k1)
    {
        let parityTag = string.slice(0, 2);
        let xString = string.slice(2, string.length);

        if (!["02", "03"].includes(parityTag)) 
        {
            throw new Error("Compressed string should start with 02 or 03");
        }
        let isEven = parityTag == "02"
        let x = BinaryAscii.numberFromHex(xString)
        let y = curve.y(x, isEven=isEven)
        return new PublicKey(new Point(x, y), curve)
    };
};


exports.PublicKey = PublicKey;
