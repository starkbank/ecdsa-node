var crypto = require("crypto");
var fs = require("fs");

//First generate a pair of keys using openssl:
//openssl ecparam -name secp256k1 -genkey -out privateKey.pem
//openssl ec -in privateKey.pem -pubout -out publicKey.pem

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

var sign = crypto.createSign("sha256");
sign.update(message);
var signature = sign.sign(keys.priv);
var verify = crypto.createVerify("sha256");
verify.update(message);
verified = verify.verify(keys.pub, signature)

console.log(signature.toString("base64"))
console.log(verified)
