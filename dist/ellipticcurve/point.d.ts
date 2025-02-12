import { BigInteger } from "big-integer";
export declare class Point {
    x: BigInteger;
    y: BigInteger;
    z: BigInteger;
    constructor(x?: BigInteger, y?: BigInteger, z?: BigInteger);
    isAtInfinity(): boolean;
}
