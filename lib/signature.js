const BinaryAscii = require("./utils/binary")
const Base64 = require("./utils/base")
const der = require("./utils/der")


class Signature {
    constructor (r, s) {
        this.r = r;
        this.s = s;
    }

    toDer () {
        return der.encodeSequence(der.encodeInteger(this.r), der.encodeInteger(this.s));
    }

    toBase64 () {
        return Base64.encode(this.toDer());
    }

    static fromDer (string) {
        let result = der.removeSequence(string);
        let rs = result[0];
        let empty = result[1];
        if (empty) {
            throw new Error("trailing junk after DER signature: " + BinaryAscii.hexFromBinary(empty));
        }

        result = der.removeInteger(rs);
        let r = result[0];
        let rest = result[1];

        result = der.removeInteger(rest);
        let s = result[0];
        empty = result[1];

        if (empty) {
            throw new Error("trailing junk after DER numbers: " + BinaryAscii.hexFromBinary(empty));
        }

        return new Signature(r, s)
    }

    static fromBase64 (string) {
        let derString = Base64.decode(string);
        return this.fromDer(derString);
    }
}


exports.Signature = Signature;
