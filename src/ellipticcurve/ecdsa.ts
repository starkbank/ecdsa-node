import { sha256 } from "js-sha256";
import bigInt, { BigInteger } from "big-integer";
import * as EcdsaMath from "./math";
import { Signature } from "./signature";
import * as BinaryAscii from "./utils/binary";
import * as Integer from "./utils/integer";
import { PrivateKey } from "./privateKey";
import { PublicKey } from "./publicKey";

const randomInteger = Integer.between;
const modulo = Integer.modulo;

type HashFunction = (message: string | number[] | Uint8Array) => string;

export function sign(
  message: string,
  privateKey: PrivateKey,
  hashfunc: HashFunction = sha256,
  randNum?: BigInteger
): Signature {
  let hashMessage = hashfunc(message);
  let numberMessage = BinaryAscii.numberFromHex(hashMessage);
  let curve = privateKey.curve;

  if (!randNum) {
    randNum = randomInteger(bigInt(1), curve.N.minus(1));
  }

  let randSignPoint = EcdsaMath.multiply(
    curve.G,
    randNum,
    curve.N,
    curve.A,
    curve.P
  );
  let r = modulo(randSignPoint.x, curve.N);
  let s = modulo(
    numberMessage
      .add(r.multiply(privateKey.secret))
      .multiply(EcdsaMath.inv(randNum, curve.N)),
    curve.N
  );

  return new Signature(r, s);
}

export function verify(
  message: string,
  signature: Signature,
  publicKey: PublicKey,
  hashfunc: HashFunction = sha256
): boolean {
  let hashMessage = hashfunc(message);
  let numberMessage = BinaryAscii.numberFromHex(hashMessage);
  let curve = publicKey.curve;
  let sigR = signature.r;
  let sigS = signature.s;

  if (sigR.lesser(1) || sigR.greaterOrEquals(curve.N)) {
    return false;
  }
  if (sigS.lesser(1) || sigS.greaterOrEquals(curve.N)) {
    return false;
  }

  let inv = EcdsaMath.inv(sigS, curve.N);
  let u1 = EcdsaMath.multiply(
    curve.G,
    modulo(numberMessage.multiply(inv), curve.N),
    curve.N,
    curve.A,
    curve.P
  );
  let u2 = EcdsaMath.multiply(
    publicKey.point,
    modulo(sigR.multiply(inv), curve.N),
    curve.N,
    curve.A,
    curve.P
  );
  let v = EcdsaMath.add(u1, u2, curve.A, curve.P);

  if (v.isAtInfinity()) {
    return false;
  }
  return v.x.mod(curve.N).eq(sigR);
}
