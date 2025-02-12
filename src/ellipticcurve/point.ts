import bigInt, { BigInteger } from "big-integer";

export class Point {
  x: BigInteger;
  y: BigInteger;
  z: BigInteger;

  constructor(
    x: BigInteger = bigInt(0),
    y: BigInteger = bigInt(0),
    z: BigInteger = bigInt(0)
  ) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  isAtInfinity(): boolean {
    return this.y.equals(0);
  }
}
