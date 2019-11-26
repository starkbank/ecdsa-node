const BigInt = require("big-integer");


class Point {
    constructor (x=BigInt(0), y=BigInt(0), z=BigInt(0)) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}


exports.Point = Point;
