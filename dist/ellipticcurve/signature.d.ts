import { BigInteger } from "big-integer";
export declare class Signature {
    r: BigInteger;
    s: BigInteger;
    constructor(r: BigInteger, s: BigInteger);
    toDer(): Buffer;
    toBase64(): string;
    static fromDer(data: Buffer | string): Signature;
    static fromBase64(string: string): Signature;
}
