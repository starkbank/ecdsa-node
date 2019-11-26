exports.decode = function (string) {
    return Buffer.from(string, "base64").toString("binary");
};


exports.encode = function (string) {
    return Buffer.from(string, "binary").toString("base64");
};
