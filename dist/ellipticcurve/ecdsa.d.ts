import { BigInteger } from "big-integer";
import { Signature } from "./signature";
import { PrivateKey } from "./privateKey";
import { PublicKey } from "./publicKey";
type HashFunction = (message: string | number[] | Uint8Array) => string;
export declare function sign(message: string, privateKey: PrivateKey, hashfunc?: HashFunction, randNum?: BigInteger): Signature;
export declare function verify(message: string, signature: Signature, publicKey: PublicKey, hashfunc?: HashFunction): boolean;
export {};
