var fs = require("fs");

exports.read = function(path) {
    return fs.readFileSync(path, 'utf-8');
};
