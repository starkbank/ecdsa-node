import * as BinaryAscii from "./utils/binary";
import * as EcdsaCurve from "./curve";
import { Point } from "./point";
import * as der from "./utils/der";
import * as Math from "./math";

export class PublicKey {
  point: Point;
  curve: EcdsaCurve.CurveFp;

  constructor(point: Point, curve: EcdsaCurve.CurveFp) {
    this.point = point;
    this.curve = curve;
  }

  toString(encoded: boolean = false): Buffer {
    let xString = BinaryAscii.stringFromNumber(
      this.point.x,
      this.curve.length()
    );
    let yString = BinaryAscii.stringFromNumber(
      this.point.y,
      this.curve.length()
    );
    if (encoded) {
      return Buffer.concat([
        Buffer.from([0x00, 0x04]),
        Buffer.from(xString, "binary"),
        Buffer.from(yString, "binary"),
      ]);
    }
    return Buffer.concat([
      Buffer.from(xString, "binary"),
      Buffer.from(yString, "binary"),
    ]);
  }

  toDer(): Buffer {
    const ecOid = der.encodeOid([1, 2, 840, 10045, 2, 1]);
    const curveOid = der.encodeOid(this.curve.oid);
    const encodeEcAndOid = der.encodeSequence(ecOid, curveOid);
    const encodedPoint = der.encodeBitstring(this.toString(true));

    return der.encodeSequence(encodeEcAndOid, encodedPoint);
  }

  toPem(): string {
    return der.toPem(this.toDer(), "PUBLIC KEY");
  }

  static fromPem(string: string): PublicKey {
    return this.fromDer(der.fromPem(string));
  }

  static fromDer(data: Buffer | string): PublicKey {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
    let [s1, empty] = der.removeSequence(buf);
    if (empty.length > 0) {
      throw new Error(
        "trailing junk after DER public key: " +
          BinaryAscii.hexFromBinary(empty)
      );
    }

    let [s2, pointBitString] = der.removeSequence(s1);
    let [, rest] = der.removeObject(s2);
    let [oidCurve, empty2] = der.removeObject(rest);

    if (empty2.length > 0) {
      throw new Error(
        "trailing junk after DER public key objects: " +
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

    let [pointStr, empty3] = der.removeBitString(pointBitString);
    if (empty3.length > 0) {
      throw new Error(
        "trailing junk after public key point-string: " +
          BinaryAscii.hexFromBinary(empty3)
      );
    }

    return this.fromString(pointStr.slice(2), curve);
  }

  static fromString(
    data: Buffer | string,
    curve: EcdsaCurve.CurveFp = EcdsaCurve.secp256k1,
    validatePoint: boolean = true
  ): PublicKey {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
    let baseLen = curve.length();

    let xs = buf.slice(0, baseLen);
    let ys = buf.slice(baseLen);

    let p = new Point(
      BinaryAscii.numberFromString(xs.toString("binary")),
      BinaryAscii.numberFromString(ys.toString("binary"))
    );

    let publicKey = new PublicKey(p, curve);
    if (!validatePoint) {
      return publicKey;
    }
    if (p.isAtInfinity()) {
      throw new Error("Public Key point is at infinity");
    }
    if (!curve.contains(p)) {
      throw new Error(
        `point (${p.x},${p.y}) is not valid for curve ${curve.name}`
      );
    }
    if (!Math.multiply(p, curve.N, curve.N, curve.A, curve.P).isAtInfinity()) {
      throw new Error(
        `Point (${p.x},${p.y} * ${curve.name}.N is not at infinity`
      );
    }
    return publicKey;
  }
}
