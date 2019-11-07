## A lightweight and fast ECDSA

### Overview

This is a JavaScript fork of [ecdsa-python]


[ecdsa-python]: https://github.com/starkbank/ecdsa-python

It is compatible with OpenSSL and is fast.
It uses some elegant math as Jacobian Coordinates to speed up the ECDSA.

### Curves

We currently support `secp256k1`, but it's super easy to add more curves to the project.

### Sample Code

How to use it:

```javascript



var crypto = require("crypto");
var fs = require("fs");

//Generate new pair of valid keys first

var keys = {
  priv: fs.readFileSync("privateKey.pem"),
  pub: fs.readFileSync("publicKey.pem")
};


var j = {
	"transaction": {
		"externalId": "0b4df2f432deoide2ode2deode1019191938333sn2uhsh2us9020232a816b16298ee9175",
		"tags": ["war", "lannister", "1/2"],
		"description": "A lannister always pays his debts. Wall War 1/2"
	},
	"transfers": [
		{
			"amount": 100,
			"taxId": "594.739.480-42",
			"name": "Daenerys Targaryen Stormborn",
			"bankCode": "341",
			"branchCode": "2201",
			"accountNumber": "76543-8",
			"tags": ["daenerys", "targaryen", "transfer-1-external-id"]
		}
	]
};

var message = JSON.stringify(j);

// Or import content from file
var message = fs.readFileSync("message.txt", "utf8");

var sign = crypto.createSign("sha256");
sign.update(message);
var signature = sign.sign(keys.priv);
var verify = crypto.createVerify("sha256");
verify.update(message);
verified = verify.verify(keys.pub, signature)

console.log(signature.toString("base64"))
console.log(verified)

```
### OpenSSL

This library is compatible with OpenSSL, so you can use it to generate keys:

```
openssl ecparam -name secp256k1 -genkey -out privateKey.pem
openssl ec -in privateKey.pem -pubout -out publicKey.pem
```

Create a message.txt file and sign it:

```
openssl dgst -sha256 -sign privateKey.pem -out signatureBinary.txt message.txt
```


You can also verify it on terminal:

```
openssl dgst -sha256 -verify publicKey.pem -signature signatureBinary.txt message.txt
```

NOTE: If you want to create a Digital Signature to use in the [Stark Bank], you need to convert the binary signature to base64.

```
openssl base64 -in signatureBinary.txt -out signatureBase64.txt
```

With this library, you can do it:

```javascript
var message = fs.readFileSync("message.txt", "utf8");
// or: 
var message = JSON.stringify(j);
// Remember: signature results can be different how you manipulate the string to be signed

var sign = crypto.createSign("sha256");
sign.update(message);
var signature = sign.sign(keys.priv);
console.log(signature.toString("base64"))

```

It's time to verify:

```javascript
var verify = crypto.createVerify("sha256");
verify.update(message);
verified = verify.verify(keys.pub, signature)
console.log(verified)
```


### How to install

#### npm
```javascript
npm install crypto
```


## License

[![PyPI license](https://img.shields.io/pypi/l/ansicolortags.svg)](https://pypi.python.org/pypi/ansicolortags/)
- Copyright 2019 © <a href="https://github.com/starkbank" target="_blank">STARK BANK S.A.</a>
