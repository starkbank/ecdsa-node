exports.decode = function (string) {
    return btoa(unescape(encodeURIComponent(rawData)));
};

exports.encode = function (string) {
    return atob(string);
}
