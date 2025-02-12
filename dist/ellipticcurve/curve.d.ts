import { BigInteger } from "big-integer";
import { Point } from "./point";
export declare class CurveFp {
    A: BigInteger;
    B: BigInteger;
    P: BigInteger;
    N: BigInteger;
    G: Point;
    name: string;
    nistName: string | null;
    private _oid;
    constructor(A: BigInteger, B: BigInteger, P: BigInteger, N: BigInteger, Gx: BigInteger, Gy: BigInteger, name: string, oid: number[], nistName?: string | null);
    contains(p: Point): boolean;
    length(): number;
    get oid(): number[];
}
export declare const secp256k1: CurveFp;
export declare const prime256v1: CurveFp;
export declare const p256: CurveFp;
export declare const supportedCurves: CurveFp[];
export declare const curvesByOid: {
    [key: string]: CurveFp;
};
