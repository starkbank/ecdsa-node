import { Point } from "./point";
import { modulo } from "./utils/integer";
import bigInt, { BigInteger } from "big-integer";

export function multiply(
  p: Point,
  n: BigInteger,
  N: BigInteger,
  A: BigInteger,
  P: BigInteger
): Point {
  // Fast way to multiply point and scalar in elliptic curves
  return fromJacobian(jacobianMultiply(toJacobian(p), n, N, A, P), P);
}

export function add(p: Point, q: Point, A: BigInteger, P: BigInteger): Point {
  // Fast way to add two points in elliptic curves
  return fromJacobian(jacobianAdd(toJacobian(p), toJacobian(q), A, P), P);
}

export function inv(x: BigInteger, n: BigInteger): BigInteger {
  // Extended Euclidean Algorithm. It's the 'division' in elliptic curves
  if (x.eq(0)) {
    return bigInt(0);
  }

  let lm = bigInt(1);
  let hm = bigInt(0);

  let low = modulo(x, n);
  let high = n;
  let r: BigInteger, nm: BigInteger, newLow: BigInteger;

  while (low.greater(1)) {
    r = high.over(low); // bigint division floors result automatically

    nm = hm.minus(lm.multiply(r));
    newLow = high.minus(low.multiply(r));

    high = low;
    hm = lm;
    low = newLow;
    lm = nm;
  }

  return modulo(lm, n);
}

function toJacobian(p: Point): Point {
  // Convert point to Jacobian coordinates
  return new Point(p.x, p.y, bigInt(1));
}

function fromJacobian(p: Point, P: BigInteger): Point {
  // Convert point back from Jacobian coordinates
  let z = inv(p.z, P);

  return new Point(
    modulo(p.x.multiply(z.pow(2)), P),
    modulo(p.y.multiply(z.pow(3)), P)
  );
}

function jacobianDouble(p: Point, A: BigInteger, P: BigInteger): Point {
  // Double a point in elliptic curves
  if (p.y.equals(0)) {
    return new Point(bigInt(0), bigInt(0), bigInt(0));
  }

  let ysq = modulo(p.y.pow(2), P);
  let S = modulo(p.x.multiply(ysq).multiply(4), P);
  let M = modulo(
    p.x
      .pow(2)
      .multiply(3)
      .add(A.multiply(p.z.pow(4))),
    P
  );
  let nx = modulo(M.pow(2).minus(S.multiply(2)), P);
  let ny = modulo(M.multiply(S.minus(nx)).minus(ysq.pow(2).multiply(8)), P);
  let nz = modulo(p.y.multiply(p.z).multiply(2), P);

  return new Point(nx, ny, nz);
}

function jacobianAdd(p: Point, q: Point, A: BigInteger, P: BigInteger): Point {
  // Add two points in elliptic curves
  if (p.y.equals(0)) {
    return q;
  }
  if (q.y.equals(0)) {
    return p;
  }

  let U1 = modulo(p.x.multiply(q.z.pow(2)), P);
  let U2 = modulo(q.x.multiply(p.z.pow(2)), P);
  let S1 = modulo(p.y.multiply(q.z.pow(3)), P);
  let S2 = modulo(q.y.multiply(p.z.pow(3)), P);

  if (U1.eq(U2)) {
    if (S1.neq(S2)) {
      return new Point(bigInt(0), bigInt(0), bigInt(1));
    }
    return jacobianDouble(p, A, P);
  }

  let H = U2.minus(U1);
  let R = S2.minus(S1);
  let H2 = modulo(H.multiply(H), P);
  let H3 = modulo(H.multiply(H2), P);
  let U1H2 = modulo(U1.multiply(H2), P);
  let nx = modulo(R.pow(2).minus(H3).minus(U1H2.multiply(2)), P);
  let ny = modulo(R.multiply(U1H2.minus(nx)).minus(S1.multiply(H3)), P);
  let nz = modulo(H.multiply(p.z).multiply(q.z), P);

  return new Point(nx, ny, nz);
}

function jacobianMultiply(
  p: Point,
  n: BigInteger,
  N: BigInteger,
  A: BigInteger,
  P: BigInteger
): Point {
  // Multiply point and scalar in elliptic curves
  if (p.y.equals(0) || n.eq(0)) {
    return new Point(bigInt(0), bigInt(0), bigInt(1));
  }
  if (n.eq(1)) {
    return p;
  }
  if (n.lesser(0) || n.greaterOrEquals(N)) {
    return jacobianMultiply(p, modulo(n, N), N, A, P);
  }
  if (modulo(n, bigInt(2)).eq(0)) {
    return jacobianDouble(jacobianMultiply(p, n.over(2), N, A, P), A, P);
  }
  if (modulo(n, bigInt(2)).eq(1)) {
    return jacobianAdd(
      jacobianDouble(jacobianMultiply(p, n.over(2), N, A, P), A, P),
      p,
      A,
      P
    );
  }

  throw new Error(
    `logical failure: p: ${p}, n: ${n}, N: ${N}, A: ${A}, P: ${P}`
  );
}
