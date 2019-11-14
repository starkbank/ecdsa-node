var der = require("./utils/der");
var BinaryAscii = require("./utils/binary");
var Point = require("./point").Point;
var ecdsaCurve = require("./curve");


class PublicKey {

    constructor (point, curve) {
        this.point = point;
        this.curve = curve;
    };

    toString (encoded=False) {
        xString = BinaryAscii.stringFromNumber(number=this.point.x, length=this.curve.length());
        yString = BinaryAscii.stringFromNumber(number=this.point.y, length=this.curve.length());
        if (encoded) {
            return "\x00\x04" + xString + yString;
        }
        return xString + yString;
    };

    toDer () {
        encodeEcAndOid = der.encodeSequence(der.encodeOid(1, 2, 840, 10045, 2, 1), der.encodeOid(this.curve.oid));

        return der.encodeSequence(encodeEcAndOid, der.encodeBitstring(this.toString(encoded=True)))
    };

    toPem () {
        return der.toPem(der=toBytes(this.toDer()), name="PUBLIC KEY")
    };

    fromPem (string) {
        return this.fromDer(der.fromPem(string));
    };

    fromDer (string) {
        let result = der.removeSequence(string);
        let s1 = result[0];
        let empty = result[1];
        if (empty) {
            throw new Error("trailing junk after DER public key: " + BinaryAscii.hexFromBinary(empty));
        };

        result = der.removeSequence(s1);
        let s2 = result[0];
        let pointStrBitstring = result[1];

        result = der.removeObject(s2);
        let rest = result[1];
        
        oidCurve, empty = der.removeObject(rest);
        if (empty) {
            throw new Error("trailing junk after DER public key objects: " + BinaryAscii.hexFromBinary(empty));
        };

        curve = ecdsaCurve.curvesByOid.get(oidCurve)
        if (!curve) {
            throw new Error("Unknown curve with oid " + oidCurve + ". Only the following are available: "
                + curve.supportedCurves.forEach((x) => {x.name}));
        };

        result = der.removeBitString(pointStrBitstring);
        let pointStr = result[0];
        empty = result[1];
        if (empty) {
            throw new Error("trailing junk after public key point-string: " + BinaryAscii.hexFromBinary(empty));
        };

        return this.fromString(pointStr.slice(start=2), curve);
    };

    fromString (string, curve=ecdsaCurve.secp256k1, validatePoint=True) {
        baseLen = curve.length();

        xs = string.slice(start=null, end=baseLen);
        ys = string.slice(start=baseLen);

        p = Point(x=BinaryAscii.numberFromString(xs), y=BinaryAscii.numberFromString(ys));

        if (validatePoint & !curve.contains(p)) {
            throw new Error("point (" + p.x + "," + p.y + ") is not valid");
        }

        return PublicKey(point=p, curve=curve);
    };
};


exports.PublicKey = PublicKey;