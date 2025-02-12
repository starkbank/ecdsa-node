import { Point } from "./point";
import { BigInteger } from "big-integer";
export declare function multiply(p: Point, n: BigInteger, N: BigInteger, A: BigInteger, P: BigInteger): Point;
export declare function add(p: Point, q: Point, A: BigInteger, P: BigInteger): Point;
export declare function inv(x: BigInteger, n: BigInteger): BigInteger;
