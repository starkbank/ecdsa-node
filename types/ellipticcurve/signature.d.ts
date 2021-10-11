export class Signature {
    static fromDer(string: any): Signature;
    static fromBase64(string: any): Signature;
    constructor(r: any, s: any);
    r: any;
    s: any;
    toDer(): string;
    toBase64(): string;
}
