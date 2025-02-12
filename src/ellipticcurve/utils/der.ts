import * as Base64 from "./base";
import * as BinaryAscii from "./binary";
import { modulo } from "./integer";
import bigInt, { BigInteger } from "big-integer";

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

export function encodeSequence(...args: (Buffer | string)[]): Buffer {
  const buffers = args.map((arg) =>
    Buffer.isBuffer(arg) ? arg : Buffer.from(arg, "binary")
  );
  let totalLength = buffers.reduce((acc, curr) => acc + curr.length, 0);
  return Buffer.concat([hex0, _encodeLength(totalLength), ...buffers]);
}

export function encodeInteger(x: BigInteger): Buffer {
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

export function encodeOid(pieces: number[]): Buffer {
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

export function encodeBitstring(t: Buffer | string): Buffer {
  const data = Buffer.isBuffer(t) ? t : Buffer.from(t, "binary");
  return Buffer.concat([hexC, _encodeLength(data.length), data]);
}

export function encodeOctetString(t: Buffer | string): Buffer {
  const data = Buffer.isBuffer(t) ? t : Buffer.from(t, "binary");
  return Buffer.concat([hexD, _encodeLength(data.length), data]);
}

export function encodeConstructed(tag: number, value: Buffer | string): Buffer {
  const data = Buffer.isBuffer(value) ? value : Buffer.from(value, "binary");
  return Buffer.concat([
    Buffer.from([hex129 + tag]),
    _encodeLength(data.length),
    data,
  ]);
}

export function removeSequence(data: Buffer | string): [Buffer, Buffer] {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
  _checkSequenceError(buf, bytesHex0, "30");

  let [length, lengthLen] = _readLength(buf.slice(1));
  let endSeq = 1 + lengthLen + length;

  return [buf.slice(1 + lengthLen, endSeq), buf.slice(endSeq)];
}

export function removeInteger(data: Buffer | string): [BigInteger, Buffer] {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
  _checkSequenceError(buf, bytesHexB, "02");

  let [length, lengthLen] = _readLength(buf.slice(1));
  let numberBytes = buf.slice(1 + lengthLen, 1 + lengthLen + length);
  let rest = buf.slice(1 + lengthLen + length);

  if (numberBytes[0] >= hex160) {
    throw new Error("nBytes must be < 160");
  }

  return [bigInt(numberBytes.toString("hex"), 16), rest];
}

export function removeObject(data: Buffer | string): [number[], Buffer] {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
  _checkSequenceError(buf, bytesHexF, "06");

  let [length, lengthLen] = _readLength(buf.slice(1));
  let body = buf.slice(1 + lengthLen, 1 + lengthLen + length);
  let rest = buf.slice(1 + lengthLen + length);

  let numbers: number[] = [];
  let remaining = body;
  while (remaining.length > 0) {
    let [n, lengthLength] = _readNumber(remaining);
    numbers.push(n);
    remaining = remaining.slice(lengthLength);
  }

  let n0 = numbers.shift()!;
  let first = Math.floor(n0 / 40);
  let second = n0 - 40 * first;

  return [[first, second, ...numbers], rest];
}

export function removeBitString(data: Buffer | string): [Buffer, Buffer] {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
  _checkSequenceError(buf, bytesHexC, "03");

  let [length, lengthLen] = _readLength(buf.slice(1));
  let body = buf.slice(1 + lengthLen, 1 + lengthLen + length);
  let rest = buf.slice(1 + lengthLen + length);

  return [body, rest];
}

export function removeOctetString(data: Buffer | string): [Buffer, Buffer] {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
  _checkSequenceError(buf, bytesHexD, "04");

  let [length, lengthLen] = _readLength(buf.slice(1));
  let body = buf.slice(1 + lengthLen, 1 + lengthLen + length);
  let rest = buf.slice(1 + lengthLen + length);

  return [body, rest];
}

export function removeConstructed(
  data: Buffer | string
): [number, Buffer, Buffer] {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
  let s0 = buf[0];
  if ((s0 & hex224) != hex129) {
    throw new Error(
      "wanted constructed tag (0xa0-0xbf), got 0x" + s0.toString(16)
    );
  }

  let tag = s0 & hex31;
  let [length, lengthLen] = _readLength(buf.slice(1));
  let body = buf.slice(1 + lengthLen, 1 + lengthLen + length);
  let rest = buf.slice(1 + lengthLen + length);

  return [tag, body, rest];
}

export function fromPem(pem: string): Buffer {
  let stripped = pem
    .split("\n")
    .filter((line) => !line.startsWith("-----"))
    .join("")
    .trim();

  return Base64.decode(stripped);
}

export function toPem(der: Buffer | string, name: string): string {
  let b64 = Base64.encode(der);
  let lines = [`-----BEGIN ${name}-----\n`];

  for (let start = 0; start <= b64.length; start += 64) {
    lines.push(b64.slice(start, start + 64) + "\n");
  }
  lines.push(`-----END ${name}-----\n`);

  return lines.join("");
}

function _encodeLength(length: number): Buffer {
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

function _encodeNumber(n: number): Buffer {
  if (n < 0) {
    throw new Error("n cannot be negative");
  }

  if (n === 0) {
    return Buffer.from([0]);
  }

  let l: number[] = [];
  while (n > 0) {
    l.unshift(n & hex127);
    n = n >> 7;
  }

  for (let i = 0; i < l.length - 1; i++) {
    l[i] = l[i] | hex160;
  }

  return Buffer.from(l);
}

function _readLength(buf: Buffer): [number, number] {
  let num = buf[0];

  if (!(num & hex160)) {
    return [num, 1];
  }

  let lengthLen = num - hex160;
  let numberBytes = buf.slice(1, 1 + lengthLen);
  return [parseInt(numberBytes.toString("hex"), 16), 1 + lengthLen];
}

function _readNumber(buf: Buffer): [number, number] {
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

function _checkSequenceError(
  buf: Buffer,
  start: Buffer,
  expected: string
): void {
  if (buf[0] !== start[0]) {
    throw new Error(`wanted sequence starting with ${expected}`);
  }
}

function _extractFirstInt(buf: Buffer): number {
  return buf[0];
}
