Base64 = require("./utils/base")
BinaryAscii = require("./utils/binary")
Base64 = require("./utils/base")
der = require("./utils/der")


class Signature {
    constructor (r, s) {
        this.r = r;
        this.s = s;
    }

    toDer = function () {
        return der.encodeSequence(der.encodeInteger(this.r), der.encodeInteger(this.s));
    }

    toBase64 = function () {
        return der.toString(Base64.encode(toBytes(this.toDer())));
    }

    fromDer = function () {
        rs, empty = der.removeSequence(string);
        if (empty) {
            throw "trailing junk after DER signature: " + BinaryAscii.hexFromBinary(empty);
        }

        let result = der.removeInteger(rs);
        let r = result[0];
        let rest = result[1];

        result = der.removeInteger(rest);
        let s = result[0];
        let empty = result[1];

        if (empty) {
            throw "trailing junk after DER numbers: " + BinaryAscii.hexFromBinary(empty);
        }

        return new Signature(r, s)
    }

    fromBase64 = function () {
        der = Base64.decode(string);
        return this.fromDer(der);
    }
}