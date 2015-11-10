
/*
 * Basicly to seperate functions.  2015 0828
 */

var u    = require("underscore");
var uuid = require("node-uuid");
var path = require("path");


var ggconfig =  require("../config/config.js");


/*
 * This check the meta has at least attributes: name, path, owner.
 * path actually include name, it's a kind of duplication, but make easy in
 * use.
 *
 * The function and `fix_file_meta` is copied from ../aws/simple-file-v3.js
 * 2015 0828
 */
function meta_has_basics(_meta) {
    var err;
    err = 0;
    if (_meta.name == null) {
        err += 1;
    }
    if (_meta.path == null) {
        err += 1;
    }
    if (_meta.owner == null) {
        err += 1;
    }
    if (!u.isString(_meta.name)) {
        err += 1;
    }
    if (!u.isString(_meta.path)) {
        err += 1;
    }
    if (!u.isString(_meta.owner)) {
        err += 1;
    }
    if (err === 0) {
        return true;
    } else {
        return false;
    }
}


function fix_file_meta(_meta) {
    var err;
    if (!meta_has_basics(_meta)) {
        err = 'can not do this meta data: ' + _meta.toString();
        throw new Error(err);
    }
    if (_meta.dir == null) {
        _meta.dir = path.dirname(_meta.path);
    }
    if (_meta.timestamp == null) {
        _meta.timestamp = Date.now();
    }
    if (_meta.uuid == null) {
        _meta.uuid = uuid.v4();
    }
    _meta.new_meta_s3key = path.join(ggconfig.new_meta_prefix, _meta.dir, _meta.uuid);
    _meta.initial_key = _meta.new_meta_s3key;
    _meta.s3key = path.join(ggconfig.raw_file_prefix, _meta.dir, _meta.uuid);
    _meta.storage = {
        type: 's3',
        key: _meta.s3key
    };

    // 2015 0909
    _meta.path_uuid = path.join(_meta.dir, _meta.uuid);
    return _meta;
}


module.exports.fix_file_meta = fix_file_meta;
module.exports.meta_has_basics = meta_has_basics;


