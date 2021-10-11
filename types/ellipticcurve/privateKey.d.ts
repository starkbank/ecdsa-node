export class PrivateKey {
    static fromPem(string: any): PrivateKey;
    static fromDer(string: any): PrivateKey;
    static fromString(string: any, curve?: EcdsaCurve.CurveFp): PrivateKey;
    constructor(curve?: EcdsaCurve.CurveFp, secret?: any);
    curve: EcdsaCurve.CurveFp;
    secret: any;
    publicKey(): PublicKey;
    toString(): string;
    toDer(): string;
    toPem(): any;
}
import EcdsaCurve = require("./curve");
import PublicKey_1 = require("./publicKey");
import PublicKey = PublicKey_1.PublicKey;
