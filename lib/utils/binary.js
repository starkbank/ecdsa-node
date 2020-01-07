const BigInt = require("big-integer");


var hexFromBinary = function (data) {
    // Return the hexadecimal representation of the binary data. Every byte of data is converted into the
    // corresponding 2-digit hex representation. The resulting string is therefore twice as long as the length of data.

    // :param data: binary
    // :return: hexadecimal string

    return Buffer.from(data, "binary").toString("hex");
}


var binaryFromHex = function (data) {
    // Return the binary data represented by the hexadecimal string hexstr. This function is the inverse of b2a_hex().
    // hexstr must contain an even number of hexadecimal digits (which can be upper or lower case), otherwise a TypeError is raised.

    // :param data: hexadecimal string
    // :return: binary

    return Buffer.from(data, "hex").toString('binary');
}


var numberFromString = function (string) {
    // Get a number representation of a string

    // :param String to be converted in a number
    // :return: Number in hex from string

    return numberFromHex(hexFromBinary(string.toString()));
}


var numberFromHex = function (string) {
    return BigInt(string, 16);
}


var stringFromNumber = function (number, length) {
    // Get a string representation of a number

    // :param number to be converted in a string
    // :param length max number of character for the string
    // :return: hexadecimal string

    let result = number.toString(16);

    while (result.length < 2 * length) {
        result = "0" + result;
    }

    return binaryFromHex(result);
}


exports.hexFromBinary = hexFromBinary;
exports.binaryFromHex = binaryFromHex;
exports.numberFromString = numberFromString;
exports.numberFromHex = numberFromHex;
exports.stringFromNumber = stringFromNumber;
