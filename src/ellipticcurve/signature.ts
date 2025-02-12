import * as BinaryAscii from "./utils/binary";
import * as Base64 from "./utils/base";
import * as der from "./utils/der";
import bigInt, { BigInteger } from "big-integer";

export class Signature {
  r: BigInteger;
  s: BigInteger;

  constructor(r: BigInteger, s: BigInteger) {
    this.r = r;
    this.s = s;
  }

  toDer(): Buffer {
    const rEncoded = der.encodeInteger(this.r);
    const sEncoded = der.encodeInteger(this.s);
    return der.encodeSequence(rEncoded, sEncoded);
  }

  toBase64(): string {
    return Base64.encode(this.toDer());
  }

  static fromDer(data: Buffer | string): Signature {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
    let [rs, empty] = der.removeSequence(buf);
    if (empty.length > 0) {
      throw new Error(
        "trailing junk after DER signature: " + BinaryAscii.hexFromBinary(empty)
      );
    }

    let [r, rest] = der.removeInteger(rs);
    let [s, empty2] = der.removeInteger(rest);

    if (empty2.length > 0) {
      throw new Error(
        "trailing junk after DER numbers: " + BinaryAscii.hexFromBinary(empty2)
      );
    }

    return new Signature(r, s);
  }

  static fromBase64(string: string): Signature {
    let derString = Base64.decode(string);
    return this.fromDer(derString);
  }
}
