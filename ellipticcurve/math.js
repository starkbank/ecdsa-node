const Point = require("./point").Point;
const modulo = require("./utils/integer").modulo;
const BigInt = require("big-integer");


var multiply = function (p, n, N, A, P) {
    // Fast way to multily point and scalar in elliptic curves

    // :param p: First Point to mutiply
    // :param n: Scalar to mutiply
    // :param N: Order of the elliptic curve
    // :param P: Prime number in the module of the equation Y^2 = X^3 + A*X + B (mod p)
    // :param A: Coefficient of the first-order term of the equation Y^2 = X^3 + A*X + B (mod p)
    // :return: Point that represents the sum of First and Second Point

    return fromJacobian(jacobianMultiply(toJacobian(p), n, N, A, P), P);
};


var add = function (p, q, A, P) {
    // Fast way to add two points in elliptic curves

    // :param p: First Point you want to add
    // :param q: Second Point you want to add
    // :param P: Prime number in the module of the equation Y^2 = X^3 + A*X + B (mod p)
    // :param A: Coefficient of the first-order term of the equation Y^2 = X^3 + A*X + B (mod p)
    // :return: Point that represents the sum of First and Second Point

    return fromJacobian(jacobianAdd(toJacobian(p), toJacobian(q), A, P), P);
};


var inv = function (x, n) {
    // Extended Euclidean Algorithm. It's the 'division' in elliptic curves

    // :param x: Divisor
    // :param n: Mod for division
    // :return: Value representing the division

    if (x.eq(0)) {
        return BigInt(0);
    };

    let lm = BigInt(1);
    let hm = BigInt(0);

    let low = modulo(x, n);
    let high = n;
    let r, nm, newLow;

    while (low.greater(1)) {
        r = high.over(low);  // bigint division floors result automaticaly

        nm = hm.minus(lm.multiply(r));
        newLow = high.minus(low.multiply(r));

        high = low;
        hm = lm;
        low = newLow;
        lm = nm;
    };

    return modulo(lm, n);
};


var toJacobian = function (p) {
    // Convert point to Jacobian coordinates

    // :param p: First Point you want to add
    // :return: Point in Jacobian coordinates

    return new Point(p.x, p.y, BigInt(1));
};


var fromJacobian = function (p, P) {
    // Convert point back from Jacobian coordinates

    // :param p: First Point you want to add
    // :param P: Prime number in the module of the equation Y^2 = X^3 + A*X + B (mod p)
    // :return: Point in default coordinates

    var z = inv(p.z, P);

    var point = new Point(
        modulo(p.x.multiply(z.pow(2)), P),
        modulo(p.y.multiply(z.pow(3)), P)
    );

    return point;
};


var jacobianDouble = function (p, A, P) {
    // Double a point in elliptic curves

    // :param p: Point you want to double
    // :param P: Prime number in the module of the equation Y^2 = X^3 + A*X + B (mod p)
    // :param A: Coefficient of the first-order term of the equation Y^2 = X^3 + A*X + B (mod p)
    // :return: Point that represents the sum of First and Second Point

    if (p.y == 0) {
        return new Point(BigInt(0), BigInt(0), BigInt(0));
    };
    let ysq = modulo((p.y.pow(2)), P);
    let S = modulo((p.x.multiply(ysq).multiply(4)), P);
    let M = modulo((((p.x.pow(2)).multiply(3)).add(A.multiply(p.z.pow(4)))), P);
    let nx = modulo(((M.pow(2)).minus(S.multiply(2))), P);
    let ny = modulo((M.multiply(S.minus(nx)).minus((ysq.pow(2)).multiply(8))), P);
    let nz = modulo((p.y.multiply(p.z).multiply(2)), P);

    return new Point(nx, ny, nz);
};


var jacobianAdd = function (p, q, A, P) {
    // Add two points in elliptic curves

    // :param p: First Point you want to add
    // :param q: Second Point you want to add
    // :param P: Prime number in the module of the equation Y^2 = X^3 + A*X + B (mod p)
    // :param A: Coefficient of the first-order term of the equation Y^2 = X^3 + A*X + B (mod p)
    // :return: Point that represents the sum of First and Second Point

    if (p.y == 0) {
        return q;
    };
    if (q.y == 0) {
        return p;
    };

    let U1 = modulo(p.x.multiply(q.z.pow(2)), P);
    let U2 = modulo(q.x.multiply(p.z.pow(2)), P);
    let S1 = modulo(p.y.multiply(q.z.pow(3)), P);
    let S2 = modulo(q.y.multiply(p.z.pow(3)), P);

    if (U1.eq(U2)) {
        if (S1.neq(S2)) {
            return Point(BigInt(0), BigInt(0), BigInt(1));
        };
        return jacobianDouble(p, A, P);
    };

    let H = U2.minus(U1);
    let R = S2.minus(S1);
    let H2 = modulo((H.multiply(H)), P);
    let H3 = modulo((H.multiply(H2)), P);
    let U1H2 = modulo((U1.multiply(H2)), P);
    let nx = modulo(((R.pow(2)).minus(H3).minus(U1H2.multiply(2))), P);
    let ny = modulo((R.multiply(U1H2.minus(nx)).minus(S1.multiply(H3))), P);
    let nz = modulo((H.multiply(p.z).multiply(q.z)), P);

    return new Point(nx, ny, nz);
};


var jacobianMultiply = function (p, n, N, A, P) {
    // Multily point and scalar in elliptic curves

    // :param p: First Point to mutiply
    // :param n: Scalar to mutiply
    // :param N: Order of the elliptic curve
    // :param P: Prime number in the module of the equation Y^2 = X^3 + A*X + B (mod p)
    // :param A: Coefficient of the first-order term of the equation Y^2 = X^3 + A*X + B (mod p)
    // :return: Point that represents the sum of First and Second Point

    if (p.y.eq(0) | n.eq(0)) {
        return new Point(BigInt(0), BigInt(0), BigInt(1));
    };
    if (n.eq(1)) {
        return p;
    };
    if (n.lesser(0) | n.greaterOrEquals(N)) {
        return jacobianMultiply(p, modulo(n, N), N, A, P);
    };
    if (modulo(n, 2).eq(0)) {
        return jacobianDouble(jacobianMultiply(p, n.over(2), N, A, P), A, P);  // bigint division floors result automaticaly
    };
    if (modulo(n, 2).eq(1)) {
        return jacobianAdd(jacobianDouble(jacobianMultiply(p, n.over(2), N, A, P), A, P), p, A, P);  // bigint division floors result automaticaly
    };

    throw new Error("logical failure: p: " + p + ", n: " + n + ", N: " + N + ", A: " + A + ", P: " + P);
};


exports.multiply = multiply;
exports.add = add;
exports.inv = inv;
