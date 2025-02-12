"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiply = multiply;
exports.add = add;
exports.inv = inv;
const point_1 = require("./point");
const integer_1 = require("./utils/integer");
const big_integer_1 = __importDefault(require("big-integer"));
function multiply(p, n, N, A, P) {
    // Fast way to multiply point and scalar in elliptic curves
    return fromJacobian(jacobianMultiply(toJacobian(p), n, N, A, P), P);
}
function add(p, q, A, P) {
    // Fast way to add two points in elliptic curves
    return fromJacobian(jacobianAdd(toJacobian(p), toJacobian(q), A, P), P);
}
function inv(x, n) {
    // Extended Euclidean Algorithm. It's the 'division' in elliptic curves
    if (x.eq(0)) {
        return (0, big_integer_1.default)(0);
    }
    let lm = (0, big_integer_1.default)(1);
    let hm = (0, big_integer_1.default)(0);
    let low = (0, integer_1.modulo)(x, n);
    let high = n;
    let r, nm, newLow;
    while (low.greater(1)) {
        r = high.over(low); // bigint division floors result automatically
        nm = hm.minus(lm.multiply(r));
        newLow = high.minus(low.multiply(r));
        high = low;
        hm = lm;
        low = newLow;
        lm = nm;
    }
    return (0, integer_1.modulo)(lm, n);
}
function toJacobian(p) {
    // Convert point to Jacobian coordinates
    return new point_1.Point(p.x, p.y, (0, big_integer_1.default)(1));
}
function fromJacobian(p, P) {
    // Convert point back from Jacobian coordinates
    let z = inv(p.z, P);
    return new point_1.Point((0, integer_1.modulo)(p.x.multiply(z.pow(2)), P), (0, integer_1.modulo)(p.y.multiply(z.pow(3)), P));
}
function jacobianDouble(p, A, P) {
    // Double a point in elliptic curves
    if (p.y.equals(0)) {
        return new point_1.Point((0, big_integer_1.default)(0), (0, big_integer_1.default)(0), (0, big_integer_1.default)(0));
    }
    let ysq = (0, integer_1.modulo)(p.y.pow(2), P);
    let S = (0, integer_1.modulo)(p.x.multiply(ysq).multiply(4), P);
    let M = (0, integer_1.modulo)(p.x
        .pow(2)
        .multiply(3)
        .add(A.multiply(p.z.pow(4))), P);
    let nx = (0, integer_1.modulo)(M.pow(2).minus(S.multiply(2)), P);
    let ny = (0, integer_1.modulo)(M.multiply(S.minus(nx)).minus(ysq.pow(2).multiply(8)), P);
    let nz = (0, integer_1.modulo)(p.y.multiply(p.z).multiply(2), P);
    return new point_1.Point(nx, ny, nz);
}
function jacobianAdd(p, q, A, P) {
    // Add two points in elliptic curves
    if (p.y.equals(0)) {
        return q;
    }
    if (q.y.equals(0)) {
        return p;
    }
    let U1 = (0, integer_1.modulo)(p.x.multiply(q.z.pow(2)), P);
    let U2 = (0, integer_1.modulo)(q.x.multiply(p.z.pow(2)), P);
    let S1 = (0, integer_1.modulo)(p.y.multiply(q.z.pow(3)), P);
    let S2 = (0, integer_1.modulo)(q.y.multiply(p.z.pow(3)), P);
    if (U1.eq(U2)) {
        if (S1.neq(S2)) {
            return new point_1.Point((0, big_integer_1.default)(0), (0, big_integer_1.default)(0), (0, big_integer_1.default)(1));
        }
        return jacobianDouble(p, A, P);
    }
    let H = U2.minus(U1);
    let R = S2.minus(S1);
    let H2 = (0, integer_1.modulo)(H.multiply(H), P);
    let H3 = (0, integer_1.modulo)(H.multiply(H2), P);
    let U1H2 = (0, integer_1.modulo)(U1.multiply(H2), P);
    let nx = (0, integer_1.modulo)(R.pow(2).minus(H3).minus(U1H2.multiply(2)), P);
    let ny = (0, integer_1.modulo)(R.multiply(U1H2.minus(nx)).minus(S1.multiply(H3)), P);
    let nz = (0, integer_1.modulo)(H.multiply(p.z).multiply(q.z), P);
    return new point_1.Point(nx, ny, nz);
}
function jacobianMultiply(p, n, N, A, P) {
    // Multiply point and scalar in elliptic curves
    if (p.y.equals(0) || n.eq(0)) {
        return new point_1.Point((0, big_integer_1.default)(0), (0, big_integer_1.default)(0), (0, big_integer_1.default)(1));
    }
    if (n.eq(1)) {
        return p;
    }
    if (n.lesser(0) || n.greaterOrEquals(N)) {
        return jacobianMultiply(p, (0, integer_1.modulo)(n, N), N, A, P);
    }
    if ((0, integer_1.modulo)(n, (0, big_integer_1.default)(2)).eq(0)) {
        return jacobianDouble(jacobianMultiply(p, n.over(2), N, A, P), A, P);
    }
    if ((0, integer_1.modulo)(n, (0, big_integer_1.default)(2)).eq(1)) {
        return jacobianAdd(jacobianDouble(jacobianMultiply(p, n.over(2), N, A, P), A, P), p, A, P);
    }
    throw new Error(`logical failure: p: ${p}, n: ${n}, N: ${N}, A: ${A}, P: ${P}`);
}
