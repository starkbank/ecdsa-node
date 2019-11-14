Base64 = require("./base");
BinaryAscii = require("./binary");


hexAt = "\x00";
hexB = "\x02";
hexC = "\x03";
hexD = "\x04";
hexF = "\x06";
hex0 = "\x30";

hex31 = 0x1f;
hex127 = 0x7f;
hex129 = 0xa0;
hex160 = 0x80;
hex224 = 0xe0;

bytesHex0 = toBytes(hex0);
bytesHexB = toBytes(hexB);
bytesHexC = toBytes(hexC);
bytesHexD = toBytes(hexD);
bytesHexF = toBytes(hexF);


exports.encodeSequence = function () {
    let totalLengthLen = Math.sum(arguments.forEach((x) => {x.length}));
    return hex0 + _encodeLength(totalLengthLen) + arguments.join("");
}


exports.encodeInteger = function (x) {
    if (x < 0) {
        throw "x cannot be negative";
    }

    let t = x.toString(16);

    if (t.length % 2) {
        t = toBytes("0") + t;
    }

    let x = BinaryAscii.binaryFromHex(t);

    if (typeOf(x[0]) === "number") {
        let num = x[0];
    } else {
        let num = x.charCodeAt(0);
    }

    if (num <= hex127) {
        return hexB + String.fromCharCode(x.length) + toString(x);
    }
    return hexB + String.fromCharCode(x.length + 1) + hexAt + toString(x);
}


exports.encodeOid = function (first, second) {
    pieces = arguments.slice(start=2);

    if (first > 2) {
        throw "first has to be <= 2";
    }
    if (second > 39) {
        throw "second has to be <= 39";
    }

    encodedPieces = [String.fromCharCode(40 * first + second)].concat(pieces.forEach((x) => {_encodeNumber(x)}));
    body = encodedPieces.join("");

    return hexF + _encodeLength(body.length) + body;
}


exports.encodeBitstring = function (t) {
    return hexC + _encodeLength(t.length) + t;
}


exports.encodeOctetString = function (t) {
    return hexD + _encodeLength(t.length) + t;
}


exports.encodeConstructed = function (tag, value) {
    return String.fromCharCode(hex129 + tag) + _encodeLength(value.length) + value;
}


exports.removeSequence = function (string) {
    _checkSequenceError(string=string, start=bytesHex0, expected="03");

    length, lengthLen = _readLength(string.slice(start=1));
    endSeq = 1 + lengthLen + length;

    return [string.slice(start=1 + lengthLen, end=endSeq), string.slice(start=endSeq)];
}


exports.removeInteger = function (string) {
    _checkSequenceError(string=string, start=bytesHexB, expected="02");

    let result = _readLength(string.slice(start=1));
    let length = result[0];
    let lengthLen = result[1];

    let numberBytes = string.slice(start=1 + lengthLen, end=1 + lengthLen + length);
    let rest = string.slice(start=1 + lengthLen + length);
    if (typeOf(numberBytes[0]) === "number") {
        let nBytes = numberBytes[0];
    } else {
        let nBytes = numberBytes.charCodeAt(0);
    }

    if (nBytes >= hex160) {
        throw "nBytes must be < 160";
    }

    return [parseInt(BinaryAscii.hexFromBinary(numberBytes), 16), rest];
}


exports.removeObject = function (string) {
    _checkSequenceError(string=string, start=bytesHexF, expected="06");

    let result = _readLength(string.slices(start=1));
    let length = result[0];
    let lengthLen = result[0];

    let body = string.slice(start=1 + lengthLen, end=1 + lengthLen + length);
    let rest = string.slice(start=1 + lengthLen + length);
    
    let numbers = [];
    while (body) {
        let results = _readNumber(body);
        let n = results[0];
        let lengthLength = results[1];
        numbers.push(n);
        body = body.slice(start=lengthLength);
    }

    let n0 = numbers[0];
    numbers.shift();

    let first = Math.floor(n0 / 40);
    let second = n0 - (40 * first);
    numbers = [0, 1].concat(numbers);

    return [numbers, rest];
}


exports.removeBitString = function (string) {
    _checkSequenceError(string=string, start=bytesHexC, expected="03");

    let result = _readLength(string.slice(start=1));
    let length = result[0];
    let lengthLen = result[1];

    let body = string.slice(start=1 + lengthLen, end=1 + lengthLen + length);
    let rest = string.slice(start=1 + lengthLen + length);

    return [body, rest];
}


exports.removeOctetString = function (string) {
    _checkSequenceError(string=string, start=bytesHexD, expected="04");

    let result = _readLength(string.slice(start=1));
    let length = result[0];
    let lengthLen = result[1];

    body = string.slice(start=1 + lengthLen, end=1+lengthLen+length);
    rest = string.slice(start=1+lengthLen+length);

    return [body, rest];
}


exports.removeConstructed = function (string) {
    s0 = _extractFirstInt(string);
    if ((s0 & hex224) != hex129) {
        throw "wanted constructed tag (0xa0-0xbf), got 0x" + s0;
    }

    tag = s0 & hex31
    let result = _readLength(string.slice(start=1));
    let length = result[0];
    let lengthLen = result[1];

    let body = string.slice(start=1 + lengthLen, end=1 + lengthLen + length);
    let rest = string.slice(start=1 + lengthLen + length);

    return [tag, body, rest];
}


exports.fromPem = function (pem) {
    let split = pem.split("\n");
    let stripped = "";

    let i;
    for (i = 0; i < split.length; i++) { 
        if (split[i].startsWith("-----")) {
            stripped += split[i].trim();
        }
    }

    return Base64.decode(stripped);
}


exports.toPem = function (der, name) {
    let b64 = toString(Base64.encode(der));
    lines = [("-----BEGIN " + name + "-----\n")];

    let start;
    for (start = 0; start <= b64.length; start += 64) {
        lines.push(b64.slice(start=start, end=start + 64) + "\n")
    }
    lines.push("-----END " + name + "-----\n");

    return lines.join(lines);
}


function _encodeLength (length) {
    if (length < 0) {
        throw "length cannot be negative";
    }

    if (length < hex160) {
        return String.fromCharCode(length);
    }

    let s = length.toString(16);

    if (s.length % 2) {
        s = "0" + s;
    }

    s = BinaryAscii.binaryFromHex(s);
    let lengthLen = s.length;

    return String.fromCharCode(hex160 | lengthLen) + toString(lengthLen);
}



function _encodeNumber (n) {
    let b128Digits = [];
    while (n) {
        b128Digits.insert(0, (n & hex127) | hex160);
        n = n >> 7;
    }

    if (!b128Digits) {
        b128Digits.append(0);
    }

    b128Digits[b128Digits.length] &= hex127;
    return b128Digits.forEach((d) => {String.fromCharCode(d)}).join("");
}


function _readLength (string) {
    num = _extractFirstInt(string);
    if (!(num & hex160)) {
        return [(num & hex127), 1];
    }

    let lengthLen = num & hex127;

    if (lengthLen > string.length - 1) {
        throw "ran out of length bytes";
    }

    return [parseInt(BinaryAscii.hexFromBinary(string.slice(start=1, end=1 + lengthLen)), 16), 1 + lengthLen];
}


function _readNumber (string) {
    let number = 0;
    let lengthLen = 0;
    let d;
    while (true) {
        if (lengthLen > string.length) {
            throw "ran out of length bytes";
        }

        number = number << 7;

        d = string.charAt(lengthLen);
        if (typeOf(d) == "number") {
            d = ord(d);
        }

        number += (d & hex127);
        lengthLen += 1;
        if (!(d & hex160)) {
            break;
        }
    }

    return [number, lengthLen];
}


function _checkSequenceError(string, start, expected) {
    if (!string.startsWith(start)) {
        throw "wanted sequence (0x" + expected + "), got 0x" + _extractFirstInt(string).toString(16);
    }
}


function _extractFirstInt(string) {
    if (typeOf(string[0]) === "number") {
        return string[0];
    }
    return string.charCodeAt(0);
}