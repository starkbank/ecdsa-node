"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeSequence = encodeSequence;
exports.encodeInteger = encodeInteger;
exports.encodeOid = encodeOid;
exports.encodeBitstring = encodeBitstring;
exports.encodeOctetString = encodeOctetString;
exports.encodeConstructed = encodeConstructed;
exports.removeSequence = removeSequence;
exports.removeInteger = removeInteger;
exports.removeObject = removeObject;
exports.removeBitString = removeBitString;
exports.removeOctetString = removeOctetString;
exports.removeConstructed = removeConstructed;
exports.fromPem = fromPem;
exports.toPem = toPem;
const Base64 = __importStar(require("./base"));
const BinaryAscii = __importStar(require("./binary"));
const big_integer_1 = __importDefault(require("big-integer"));
const hexAt = Buffer.from([0x00]);
const hexB = Buffer.from([0x02]);
const hexC = Buffer.from([0x03]);
const hexD = Buffer.from([0x04]);
const hexF = Buffer.from([0x06]);
const hex0 = Buffer.from([0x30]);
const hex31 = 0x1f;
const hex127 = 0x7f;
const hex129 = 0xa0;
const hex160 = 0x80;
const hex224 = 0xe0;
const bytesHex0 = hex0;
const bytesHexB = hexB;
const bytesHexC = hexC;
const bytesHexD = hexD;
const bytesHexF = hexF;
function encodeSequence(...args) {
    const buffers = args.map((arg) => Buffer.isBuffer(arg) ? arg : Buffer.from(arg, "binary"));
    let totalLength = buffers.reduce((acc, curr) => acc + curr.length, 0);
    return Buffer.concat([hex0, _encodeLength(totalLength), ...buffers]);
}
function encodeInteger(x) {
    if (x.lesser(0)) {
        throw new Error("x cannot be negative");
    }
    let t = x.toString(16);
    if (t.length % 2) {
        t = "0" + t;
    }
    let xBinary = BinaryAscii.binaryFromHex(t);
    let num = xBinary[0];
    if (num <= hex127) {
        return Buffer.concat([hexB, Buffer.from([xBinary.length]), xBinary]);
    }
    return Buffer.concat([
        hexB,
        Buffer.from([xBinary.length + 1]),
        hexAt,
        xBinary,
    ]);
}
function encodeOid(pieces) {
    let [first, second, ...rest] = pieces;
    if (first > 2) {
        throw new Error("first has to be <= 2");
    }
    if (second > 39) {
        throw new Error("second has to be <= 39");
    }
    let encodedPieces = rest.map(_encodeNumber);
    let firstByte = Buffer.from([40 * first + second]);
    let body = Buffer.concat([
        firstByte,
        ...encodedPieces.map((p) => Buffer.from(p)),
    ]);
    return Buffer.concat([hexF, _encodeLength(body.length), body]);
}
function encodeBitstring(t) {
    const data = Buffer.isBuffer(t) ? t : Buffer.from(t, "binary");
    return Buffer.concat([hexC, _encodeLength(data.length), data]);
}
function encodeOctetString(t) {
    const data = Buffer.isBuffer(t) ? t : Buffer.from(t, "binary");
    return Buffer.concat([hexD, _encodeLength(data.length), data]);
}
function encodeConstructed(tag, value) {
    const data = Buffer.isBuffer(value) ? value : Buffer.from(value, "binary");
    return Buffer.concat([
        Buffer.from([hex129 + tag]),
        _encodeLength(data.length),
        data,
    ]);
}
function removeSequence(data) {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
    _checkSequenceError(buf, bytesHex0, "30");
    let [length, lengthLen] = _readLength(buf.slice(1));
    let endSeq = 1 + lengthLen + length;
    return [buf.slice(1 + lengthLen, endSeq), buf.slice(endSeq)];
}
function removeInteger(data) {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
    _checkSequenceError(buf, bytesHexB, "02");
    let [length, lengthLen] = _readLength(buf.slice(1));
    let numberBytes = buf.slice(1 + lengthLen, 1 + lengthLen + length);
    let rest = buf.slice(1 + lengthLen + length);
    if (numberBytes[0] >= hex160) {
        throw new Error("nBytes must be < 160");
    }
    return [(0, big_integer_1.default)(numberBytes.toString("hex"), 16), rest];
}
function removeObject(data) {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
    _checkSequenceError(buf, bytesHexF, "06");
    let [length, lengthLen] = _readLength(buf.slice(1));
    let body = buf.slice(1 + lengthLen, 1 + lengthLen + length);
    let rest = buf.slice(1 + lengthLen + length);
    let numbers = [];
    let remaining = body;
    while (remaining.length > 0) {
        let [n, lengthLength] = _readNumber(remaining);
        numbers.push(n);
        remaining = remaining.slice(lengthLength);
    }
    let n0 = numbers.shift();
    let first = Math.floor(n0 / 40);
    let second = n0 - 40 * first;
    return [[first, second, ...numbers], rest];
}
function removeBitString(data) {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
    _checkSequenceError(buf, bytesHexC, "03");
    let [length, lengthLen] = _readLength(buf.slice(1));
    let body = buf.slice(1 + lengthLen, 1 + lengthLen + length);
    let rest = buf.slice(1 + lengthLen + length);
    return [body, rest];
}
function removeOctetString(data) {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
    _checkSequenceError(buf, bytesHexD, "04");
    let [length, lengthLen] = _readLength(buf.slice(1));
    let body = buf.slice(1 + lengthLen, 1 + lengthLen + length);
    let rest = buf.slice(1 + lengthLen + length);
    return [body, rest];
}
function removeConstructed(data) {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
    let s0 = buf[0];
    if ((s0 & hex224) != hex129) {
        throw new Error("wanted constructed tag (0xa0-0xbf), got 0x" + s0.toString(16));
    }
    let tag = s0 & hex31;
    let [length, lengthLen] = _readLength(buf.slice(1));
    let body = buf.slice(1 + lengthLen, 1 + lengthLen + length);
    let rest = buf.slice(1 + lengthLen + length);
    return [tag, body, rest];
}
function fromPem(pem) {
    let stripped = pem
        .split("\n")
        .filter((line) => !line.startsWith("-----"))
        .join("")
        .trim();
    return Base64.decode(stripped);
}
function toPem(der, name) {
    let b64 = Base64.encode(der);
    let lines = [`-----BEGIN ${name}-----\n`];
    for (let start = 0; start <= b64.length; start += 64) {
        lines.push(b64.slice(start, start + 64) + "\n");
    }
    lines.push(`-----END ${name}-----\n`);
    return lines.join("");
}
function _encodeLength(length) {
    if (length < 0) {
        throw new Error("length cannot be negative");
    }
    if (length < hex160) {
        return Buffer.from([length]);
    }
    let hexLength = length.toString(16);
    if (hexLength.length % 2) {
        hexLength = "0" + hexLength;
    }
    let lengthBytes = Buffer.from(hexLength, "hex");
    return Buffer.concat([
        Buffer.from([hex160 + lengthBytes.length]),
        lengthBytes,
    ]);
}
function _encodeNumber(n) {
    if (n < 0) {
        throw new Error("n cannot be negative");
    }
    if (n === 0) {
        return Buffer.from([0]);
    }
    let l = [];
    while (n > 0) {
        l.unshift(n & hex127);
        n = n >> 7;
    }
    for (let i = 0; i < l.length - 1; i++) {
        l[i] = l[i] | hex160;
    }
    return Buffer.from(l);
}
function _readLength(buf) {
    let num = buf[0];
    if (!(num & hex160)) {
        return [num, 1];
    }
    let lengthLen = num - hex160;
    let numberBytes = buf.slice(1, 1 + lengthLen);
    return [parseInt(numberBytes.toString("hex"), 16), 1 + lengthLen];
}
function _readNumber(buf) {
    let num = buf[0];
    let length = 1;
    let n = num & hex127;
    while (num & hex160) {
        buf = buf.slice(1);
        num = buf[0];
        n = (n << 7) | (num & hex127);
        length += 1;
    }
    return [n, length];
}
function _checkSequenceError(buf, start, expected) {
    if (buf[0] !== start[0]) {
        throw new Error(`wanted sequence starting with ${expected}`);
    }
}
function _extractFirstInt(buf) {
    return buf[0];
}
