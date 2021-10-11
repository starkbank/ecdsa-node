export class PublicKey {
    static fromPem(string: any): PublicKey;
    static fromDer(string: any): PublicKey;
    static fromString(string: any, curve?: EcdsaCurve.CurveFp, validatePoint?: boolean): PublicKey;
    constructor(point: any, curve: any);
    point: any;
    curve: any;
    toString(encoded?: boolean): string;
    toDer(): string;
    toPem(): any;
}
import EcdsaCurve = require("./curve");
