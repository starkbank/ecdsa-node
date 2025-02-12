import { PublicKey } from "./publicKey";
import * as EcdsaCurve from "./curve";
import { BigInteger } from "big-integer";
export declare class PrivateKey {
    curve: EcdsaCurve.CurveFp;
    secret: BigInteger;
    constructor(curve?: EcdsaCurve.CurveFp, secret?: BigInteger);
    publicKey(): PublicKey;
    toString(): string;
    toDer(): Buffer;
    toPem(): string;
    static fromPem(string: string): PrivateKey;
    static fromDer(data: Buffer | string): PrivateKey;
    static fromString(data: Buffer | string, curve?: EcdsaCurve.CurveFp): PrivateKey;
}
