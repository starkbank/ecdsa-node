## A lightweight and fast ECDSA implementation

### Overview

This is a JS fork of ecdsa-python

It is compatible with OpenSSL and is fast.
It uses some elegant math as Jacobian Coordinates to speed up the ECDSA.

### Curves

We currently support `secp256k1`, but it's super easy to add more curves to the project. Just add them on `curve.js`

### Sample Code

How to sign a json message for [Stark Bank]:

```js
var ellipticcurve = require("@starkbank/ecdsa-node")
var Ecdsa = ellipticcurve.Ecdsa
var PrivateKey = ellipticcurve.PrivateKey

// Generate privateKey from PEM string
var privateKey = PrivateKey.fromPem("""
    -----BEGIN EC PARAMETERS-----
    BgUrgQQACg==
    -----END EC PARAMETERS-----
    -----BEGIN EC PRIVATE KEY-----
    MHQCAQEEIODvZuS34wFbt0X53+P5EnSj6tMjfVK01dD1dgDH02RzoAcGBSuBBAAK
    oUQDQgAE/nvHu/SQQaos9TUljQsUuKI15Zr5SabPrbwtbfT/408rkVVzq8vAisbB
    RmpeRREXj5aog/Mq8RrdYy75W9q/Ig==
    -----END EC PRIVATE KEY-----
""")

// Create message from json
let message = JSON.stringify({
    "transfers": [
        {
            "amount": 100000000,
            "taxId": "594.739.480-42",
            "name": "Daenerys Targaryen Stormborn",
            "bankCode": "341",
            "branchCode": "2201",
            "accountNumber": "76543-8",
            "tags": ["daenerys", "targaryen", "transfer-1-external-id"]
        }
    ]
})

signature = Ecdsa.sign(message, privateKey)

// Generate Signature in base64. This result can be sent to Stark Bank in header as Digital-Signature parameter
console.log(signature.toBase64())

// To double check if message matches the signature
let publicKey = privateKey.publicKey()

console.log(Ecdsa.verify(message, signature, publicKey))
```

Simple use:

```js
var ellipticcurve = require("@starkbank/ecdsa-node")
var Ecdsa = ellipticcurve.Ecdsa
var PrivateKey = ellipticcurve.PrivateKey

// Generate new Keys
let privateKey = PrivateKey()
let publicKey = privateKey.publicKey()

let message = "My test message"

// Generate Signature
let signature = Ecdsa.sign(message, privateKey)

// Verify if signature is valid
console.log(Ecdsa.verify(message, signature, publicKey))
```

### OpenSSL

This library is compatible with OpenSSL, so you can use it to generate keys:

```
openssl ecparam -name secp256k1 -genkey -out privateKey.pem
openssl ec -in privateKey.pem -pubout -out publicKey.pem
```

Create a message.txt file and sign it:

```
openssl dgst -sha256 -sign privateKey.pem -out signatureDer.txt message.txt
```

It's time to verify:

```js
var ellipticcurve = require("@starkbank/ecdsa-node")
var Ecdsa = ellipticcurve.Ecdsa
var Signature = ellipticcurve.Signature
var PublicKey = ellipticcurve.PublicKey
var File = ellipticcurve.utils.File

let publicKeyPem = File.read("publicKey.pem")
let signatureDer = File.read("signatureDer.txt", "rb")
let message = File.read("message.txt")

let publicKey = PublicKey.fromPem(publicKeyPem)
let signature = Signature.fromDer(signatureDer)

console.log(Ecdsa.verify(message, signature, publicKey))
```

You can also verify it on terminal:

```
openssl dgst -sha256 -verify publicKey.pem -signature signatureDer.txt message.txt
```

NOTE: If you want to create a Digital Signature to use in the [Stark Bank], you need to convert the binary signature to base64.

```
openssl base64 -in signatureDer.txt -out signatureBase64.txt
```

With this library, you can do it:

```js
var ellipticcurve = require("@starkbank/ecdsa-node")
var Signature = ellipticcurve.Signature
var File = ellipticcurve.utils.File

let signatureDer = File.read("signatureDer.txt", "rb")

let signature = Signature.fromDer(signatureDer)

console.log(signature.toBase64())
```

[Stark Bank]: https://starkbank.com

### How to install

```
npm install @starkbank/ecdsa-node
```

### Run all unit tests

```
node tests/start.js
```
