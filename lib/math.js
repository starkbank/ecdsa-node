var Point = require("./point").Point;


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

    if (x === 0n) {
        return 0n;
    };

    let lm = 1n;
    let hm = 0n;

    let low = x % n;
    let high = n;
    let r, nm, newLow;

    while (low > 1n) {
        r = high / low;  // bigint division floors result automaticaly

        nm = hm - (lm * r);
        newLow = high - (low * r);

        high = low;
        hm = lm;
        low = newLow;
        lm = nm;
    };

    if (lm < 0) {
        lm += n;
    }

    return lm % n;
};

var toJacobian = function (p) {
    // Convert point to Jacobian coordinates

    // :param p: First Point you want to add
    // :return: Point in Jacobian coordinates

    return new Point(p.x, p.y, 1n);
};

var fromJacobian = function (p, P) {
    // Convert point back from Jacobian coordinates

    // :param p: First Point you want to add
    // :param P: Prime number in the module of the equation Y^2 = X^3 + A*X + B (mod p)
    // :return: Point in default coordinates

    z = inv(p.z, P);

    return new Point((p.x * z ** 2n) % P, (p.y * z ** 3n) % P);
};


var jacobianDouble = function (p, A, P) {
    // Double a point in elliptic curves

    // :param p: Point you want to double
    // :param P: Prime number in the module of the equation Y^2 = X^3 + A*X + B (mod p)
    // :param A: Coefficient of the first-order term of the equation Y^2 = X^3 + A*X + B (mod p)
    // :return: Point that represents the sum of First and Second Point

    if (!p.y) {
        return new Point(0n, 0n, 0n);
    };
    let ysq = (p.y ** 2n) % P;
    let S = (4n * p.x * ysq) % P;
    let M = (3n * p.x ** 2n + A * p.z ** 4n) % P;
    let nx = (M ** 2n - 2n * S) % P;
    let ny = (M * (S - nx) - 8n * ysq ** 2n) % P;
    let nz = (2n * p.y * p.z) % P;

    return new Point(nx, ny, nz);
};

var jacobianAdd = function (p, q, A, P) {
    // Add two points in elliptic curves

    // :param p: First Point you want to add
    // :param q: Second Point you want to add
    // :param P: Prime number in the module of the equation Y^2 = X^3 + A*X + B (mod p)
    // :param A: Coefficient of the first-order term of the equation Y^2 = X^3 + A*X + B (mod p)
    // :return: Point that represents the sum of First and Second Point

    if (!p.y) {
        return q;
    };
    if (!q.y) {
        return p;
    };

    U1 = (p.x * q.z ** 2n) % P;
    U2 = (q.x * p.z ** 2n) % P;
    S1 = (p.y * q.z ** 3n) % P;
    S2 = (q.y * p.z ** 3n) % P;

    if (U1 == U2) {
        if (S1 != S2) {
            return Point(0n, 0n, 1n);
        };
        return jacobianDouble(p, A, P);
    };

    H = U2 - U1;
    R = S2 - S1;
    H2 = (H * H) % P;
    H3 = (H * H2) % P;
    U1H2 = (U1 * H2) % P;
    nx = (R ** 2n - H3 - 2n * U1H2) % P;
    ny = (R * (U1H2 - nx) - S1 * H3) % P;
    nz = (H * p.z * q.z) % P;

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

    if (p.y === 0n | n === 0n) {
        return new Point(0n, 0n, 1n);
    };
    if (n === 1n) {
        return p;
    };
    if (n < 0n | n >= N) {
        return jacobianMultiply(p, n % N, N, A, P);
    };
    if ((n % 2n) === 0n) {
        return jacobianDouble(jacobianMultiply(p, n / 2n, N, A, P), A, P);  // bigint division floors result automaticaly
    };
    if ((n % 2n) === 1n) {
        return jacobianAdd(jacobianDouble(jacobianMultiply(p, n / 2n, N, A, P), A, P), p, A, P);  // bigint division floors result automaticaly
    };

    throw new Error("logical failure: p: " + p + ", n: " + n + ", N: " + N + ", A: " + A + ", P: " + P);
};

exports.multiply = multiply;
exports.add = add;
exports.inv = inv;