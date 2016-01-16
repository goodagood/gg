
var _build_ul = function(hash) {
    var ul;
    ul = '<ul class="key-value"> \n';
    u.each(hash, function(val, key) {
        var li;
        li = '<li class="key"> <span>' + key.toString() + "</span> : ";
        if (u.isArray(val)) {
            li += _build_ul(val);
        } else if (u.isObject(val)) {
            li += _build_ul(val);
        } else if (!val) {
            li += '<span class="value">' + (" " + val + " </span>");
        } else {
            li += '<span class="value">' + val.toString() + '</span>';
        }
        li += "</li>\n";
        return ul += li + "\n";
    });
    ul += "</ul>\n";
    return ul;
};
module.exports.to_ul = _build_ul;
