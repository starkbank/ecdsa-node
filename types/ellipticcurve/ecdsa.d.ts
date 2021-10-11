export function sign(message: any, privateKey: any, hashfunc?: any, randNum?: any): Signature;
export function verify(message: any, signature: any, publicKey: any, hashfunc?: typeof sha256): any;
import Signature_1 = require("./signature");
import Signature = Signature_1.Signature;
import sha256 = require("js-sha256");
