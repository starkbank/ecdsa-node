"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexFromBinary = hexFromBinary;
exports.binaryFromHex = binaryFromHex;
exports.numberFromString = numberFromString;
exports.numberFromHex = numberFromHex;
exports.stringFromNumber = stringFromNumber;
const big_integer_1 = __importDefault(require("big-integer"));
function hexFromBinary(data) {
    // Return the hexadecimal representation of the binary data. Every byte of data is converted into the
    // corresponding 2-digit hex representation. The resulting string is therefore twice as long as the length of data.
    // :param data: binary
    // :return: hexadecimal string
    if (Buffer.isBuffer(data)) {
        return data.toString("hex");
    }
    return Buffer.from(data, "binary").toString("hex");
}
function binaryFromHex(data) {
    // Return the binary data represented by the hexadecimal string hexstr. This function is the inverse of b2a_hex().
    // hexstr must contain an even number of hexadecimal digits (which can be upper or lower case), otherwise a TypeError is raised.
    // :param data: hexadecimal string
    // :return: binary
    return Buffer.from(data, "hex");
}
function numberFromString(string) {
    // Get a number representation of a string
    // :param String to be converted in a number
    // :return: Number in hex from string
    return numberFromHex(hexFromBinary(string.toString()));
}
function numberFromHex(string) {
    return (0, big_integer_1.default)(string, 16);
}
function stringFromNumber(number, length) {
    // Get a string representation of a number
    // :param number to be converted in a string
    // :param length max number of character for the string
    // :return: hexadecimal string
    let result = number.toString(16);
    while (result.length < 2 * length) {
        result = "0" + result;
    }
    return binaryFromHex(result).toString("binary");
}
