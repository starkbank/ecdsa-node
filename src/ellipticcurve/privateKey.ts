import { PublicKey } from "./publicKey";
import * as RandomInteger from "./utils/integer";
import * as BinaryAscii from "./utils/binary";
import * as EcdsaCurve from "./curve";
import * as EcdsaMath from "./math";
import bigInt, { BigInteger } from "big-integer";
import * as der from "./utils/der";

const hexAt = "\x00";

export class PrivateKey {
  curve: EcdsaCurve.CurveFp;
  secret: BigInteger;

  constructor(
    curve: EcdsaCurve.CurveFp = EcdsaCurve.secp256k1,
    secret?: BigInteger
  ) {
    this.curve = curve;
    if (secret) {
      this.secret = secret;
    } else {
      this.secret = RandomInteger.between(bigInt(1), curve.N.minus(1));
    }
  }

  publicKey(): PublicKey {
    let curve = this.curve;
    let publicPoint = EcdsaMath.multiply(
      curve.G,
      this.secret,
      curve.N,
      curve.A,
      curve.P
    );
    return new PublicKey(publicPoint, curve);
  }

  toString(): string {
    return BinaryAscii.stringFromNumber(this.secret, this.curve.length());
  }

  toDer(): Buffer {
    let encodedPublicKey = this.publicKey().toString(true);

    return der.encodeSequence(
      der.encodeInteger(bigInt(1)),
      der.encodeOctetString(this.toString()),
      der.encodeConstructed(0, der.encodeOid(this.curve.oid)),
      der.encodeConstructed(1, der.encodeBitstring(encodedPublicKey))
    );
  }

  toPem(): string {
    return der.toPem(this.toDer(), "EC PRIVATE KEY");
  }

  static fromPem(string: string): PrivateKey {
    // Extract the private key part from the PEM file
    const privateKeyMatch = string.match(
      /-----BEGIN EC PRIVATE KEY-----\n([^-]+)\n-----END EC PRIVATE KEY-----/
    );
    if (!privateKeyMatch) {
      throw new Error("Invalid PEM format: EC PRIVATE KEY section not found");
    }
    const privateKeyPem = privateKeyMatch[1];
    return this.fromDer(Buffer.from(privateKeyPem, "base64"));
  }

  static fromDer(data: Buffer | string): PrivateKey {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
    let [s1, empty] = der.removeSequence(buf);
    if (empty.length > 0) {
      throw new Error(
        "trailing junk after DER private key: " +
          BinaryAscii.hexFromBinary(empty)
      );
    }

    let [one, rest] = der.removeInteger(s1);
    if (!one.eq(1)) {
      throw new Error("expected '1' at start of DER private key, got " + one);
    }

    let [privateKeyStr, t1] = der.removeOctetString(rest);
    let [tag, curveOidStr, t2] = der.removeConstructed(t1);

    if (tag !== 0) {
      throw new Error("expected tag 0 in DER private key, got " + tag);
    }

    let [oidCurve, empty2] = der.removeObject(curveOidStr);
    if (empty2.length > 0) {
      throw new Error(
        "trailing junk after DER private key curve_oid: " +
          BinaryAscii.hexFromBinary(empty2)
      );
    }

    let curve = EcdsaCurve.curvesByOid[oidCurve.join(".")];
    if (!curve) {
      let supportedCurvesNames = EcdsaCurve.supportedCurves.map((x) => x.name);
      throw new Error(
        "Unknown curve with oid " +
          oidCurve.join(".") +
          ". Only the following are available: " +
          supportedCurvesNames
      );
    }

    if (privateKeyStr.length < curve.length()) {
      privateKeyStr = Buffer.concat([
        Buffer.alloc(curve.length() - privateKeyStr.length, 0),
        privateKeyStr,
      ]);
    }

    return this.fromString(privateKeyStr, curve);
  }

  static fromString(
    data: Buffer | string,
    curve: EcdsaCurve.CurveFp = EcdsaCurve.secp256k1
  ): PrivateKey {
    const str = Buffer.isBuffer(data) ? data.toString("binary") : data;
    return new PrivateKey(curve, BinaryAscii.numberFromString(str));
  }
}
