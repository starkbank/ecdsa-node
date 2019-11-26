const fs = require("fs");


exports.read = function(path, encoding='utf-8') {
    return fs.readFileSync(path, encoding);
};
