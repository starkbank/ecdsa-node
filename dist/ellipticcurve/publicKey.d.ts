import * as EcdsaCurve from "./curve";
import { Point } from "./point";
export declare class PublicKey {
    point: Point;
    curve: EcdsaCurve.CurveFp;
    constructor(point: Point, curve: EcdsaCurve.CurveFp);
    toString(encoded?: boolean): Buffer;
    toDer(): Buffer;
    toPem(): string;
    static fromPem(string: string): PublicKey;
    static fromDer(data: Buffer | string): PublicKey;
    static fromString(data: Buffer | string, curve?: EcdsaCurve.CurveFp, validatePoint?: boolean): PublicKey;
}
