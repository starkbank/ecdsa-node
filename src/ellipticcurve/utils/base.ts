export function decode(string: string): Buffer {
  return Buffer.from(string, "base64");
}

export function encode(data: string | Buffer): string {
  if (Buffer.isBuffer(data)) {
    return data.toString("base64");
  }
  return Buffer.from(data, "binary").toString("base64");
}
