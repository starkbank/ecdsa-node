var der = require("./utils/der");
var BinaryAscii = require("./utils/binary");
var Point = require("./point").Point;
var curve = require("./curve");


class PublicKey {

    constructor (point, curve) {
        this.point = point;
        this.curve = curve;
    }

    toString = function (encoded=False) {
        xString = BinaryAscii.stringFromNumber(number=this.point.x, length=this.curve.length());
        yString = BinaryAscii.stringFromNumber(number=this.point.y, length=this.curve.length());
        if (encoded) {
            return "\x00\x04" + xString + yString;
        }
        return xString + yString;
    }

    toDer = function () {
        encodeEcAndOid = der.encodeSequence(der.encodeOid(1, 2, 840, 10045, 2, 1), der.encodeOid(this.curve.oid));

        return der.encodeSequence(encodeEcAndOid, der.encodeBitstring(this.toString(encoded=True)))
    }

    toPem = function () {
        return der.toPem(der=toBytes(this.toDer()), name="PUBLIC KEY")
    }

    fromPem = function (string) {
        return this.fromDer(der.fromPem(string));
    }

    fromDer = function (string) {
        s1, empty = der.removeSequence(string);
        if (empty) {
            throw "trailing junk after DER public key: " + BinaryAscii.hexFromBinary(empty);
        }

        s2, pointStrBitstring = der.removeSequence(s1)

        oidPk, rest = der.removeObject(s2)
        
        oidCurve, empty = der.removeObject(rest)
        if (empty) {
            throw "trailing junk after DER public key objects: " + BinaryAscii.hexFromBinary(empty);
        }

        curve = curve.curvesByOid.get(oidCurve)
        if (!curve) {
            throw 
                "Unknown curve with oid " + oidCurve + ". Only the following are available: "
                + curve.supportedCurves.forEach((x) => {x.name})
        }

        pointStr, empty = der.removeBitString(pointStrBitstring)
        if (empty) {
            throw "trailing junk after public key point-string: " + BinaryAscii.hexFromBinary(empty)
        }

        return this.fromString(pointStr.slice(start=2), curve)
    }

    fromString = function (string, curve=curve.secp256k1, validatePoint=True) {
        baseLen = curve.length()

        xs = string.slice(start=null, end=baseLen);
        ys = string.slice(start=baseLen);

        p = Point(x=BinaryAscii.numberFromString(xs), y=BinaryAscii.numberFromString(ys));

        if (validatePoint & !curve.contains(p)) {
            throw "point (" + p.x + "," + p.y + ") is not valid";
        }

        return PublicKey(point=p, curve=curve);
    }
}