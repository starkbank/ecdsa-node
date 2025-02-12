import * as fs from "fs";

export function read(path: string, encoding: BufferEncoding = "utf-8"): string {
  return fs.readFileSync(path, encoding);
}
