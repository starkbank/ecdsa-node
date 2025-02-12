import bigInt from "big-integer";
export declare function hexFromBinary(data: string | Buffer): string;
export declare function binaryFromHex(data: string): Buffer;
export declare function numberFromString(string: string): bigInt.BigInteger;
export declare function numberFromHex(string: string): bigInt.BigInteger;
export declare function stringFromNumber(number: bigInt.BigInteger, length: number): string;
