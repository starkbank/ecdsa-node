//
// Elliptic Curve Equation
//
// y^2 = x^3 + A*x + B (mod P)
//

import bigInt, { BigInteger } from "big-integer";
import { Point } from "./point";
import { modulo } from "./utils/integer";

export class CurveFp {
  A: BigInteger;
  B: BigInteger;
  P: BigInteger;
  N: BigInteger;
  G: Point;
  name: string;
  nistName: string | null;
  private _oid: number[];

  constructor(
    A: BigInteger,
    B: BigInteger,
    P: BigInteger,
    N: BigInteger,
    Gx: BigInteger,
    Gy: BigInteger,
    name: string,
    oid: number[],
    nistName: string | null = null
  ) {
    this.A = A;
    this.B = B;
    this.P = P;
    this.N = N;
    this.G = new Point(Gx, Gy);
    this.name = name;
    this.nistName = nistName;
    this._oid = oid;
  }

  contains(p: Point): boolean {
    if (p.x.lesser(0) || p.x.greater(this.P.minus(1))) {
      return false;
    }
    if (p.y.lesser(0) || p.y.greater(this.P.minus(1))) {
      return false;
    }
    if (
      !modulo(
        p.y.pow(2).minus(p.x.pow(3).add(this.A.multiply(p.x)).add(this.B)),
        this.P
      ).equals(0)
    ) {
      return false;
    }
    return true;
  }

  length(): number {
    return Math.floor((1 + this.N.toString(16).length) / 2);
  }

  get oid(): number[] {
    return [...this._oid];
  }
}

export const secp256k1 = new CurveFp(
  bigInt(
    "0000000000000000000000000000000000000000000000000000000000000000",
    16
  ),
  bigInt(
    "0000000000000000000000000000000000000000000000000000000000000007",
    16
  ),
  bigInt(
    "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f",
    16
  ),
  bigInt(
    "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141",
    16
  ),
  bigInt(
    "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
    16
  ),
  bigInt(
    "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",
    16
  ),
  "secp256k1",
  [1, 3, 132, 0, 10]
);

export const prime256v1 = new CurveFp(
  bigInt(
    "ffffffff00000001000000000000000000000000fffffffffffffffffffffffc",
    16
  ),
  bigInt(
    "5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b",
    16
  ),
  bigInt(
    "ffffffff00000001000000000000000000000000ffffffffffffffffffffffff",
    16
  ),
  bigInt(
    "ffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551",
    16
  ),
  bigInt(
    "6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296",
    16
  ),
  bigInt(
    "4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5",
    16
  ),
  "prime256v1",
  [1, 2, 840, 10045, 3, 1, 7],
  "P-256"
);

export const p256 = prime256v1;

export const supportedCurves = [secp256k1, prime256v1];

export const curvesByOid: { [key: string]: CurveFp } = {};
supportedCurves.forEach((curve) => {
  curvesByOid[curve.oid.join(".")] = curve;
});
