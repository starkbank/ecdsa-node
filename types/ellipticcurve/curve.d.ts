export class CurveFp {
    constructor(A: any, B: any, P: any, N: any, Gx: any, Gy: any, name: any, oid: any, nistName?: any);
    A: any;
    B: any;
    P: any;
    N: any;
    G: Point;
    name: any;
    nistName: any;
    _oid: any;
    contains: (p: any) => any;
    length: () => number;
    get oid(): any;
}
export let curvesByOid: {};
export let secp256k1: CurveFp;
export let prime256v1: CurveFp;
export let p256: CurveFp;
export let supportedCurves: CurveFp[];
import Point_1 = require("./point");
import Point = Point_1.Point;
