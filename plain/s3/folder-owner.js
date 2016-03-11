
/*
 * owner: {name: string, id: string}
 */

var u = require("underscore");

var user_module = require("../users/a.js");


// not needed any more 2016 0311
function guess_id(_meta){
    var guess;

    if (_meta.owner_id != null) {
        return _meta.owner_id;
    }

    guess = _meta.path.split("/")[0];
    if (u.isString(guess)) {
        return guess;
    }
    return null;
}


function get_name(_meta) {

    // In history, owner might be a string of user name.
    if (_meta.owner != null) {
        if (u.isString(_meta.owner) && (! u.isEmpty(_meta.owner))) {
            return _meta.owner;
        }

        if (!u.isEmpty(_meta.owner.name)) {
            return _meta.owner.name;
        }
    }

    // guess by folder root, but it changed to be user id.
    var guess = _meta.path.split("/")[0];
    if (u.isString(guess) && (! u.isEmpty(guess))) {
        _meta.owner = guess;
        return _meta.owner;
    }
    return null;
}
module.exports.get_name = get_name;


//?
function check_owner(_meta){
    if(u.isString(_meta.owner)) return true; // 2016 0311
   
    if(_meta.owner){
        if(_meta.owner.name){
            if(_meta.owner.id){
                if(u.isString(_meta.owner.name)){
                    if(u.isString(_meta.owner.id)){
                        if(!u.isEmpty(_meta.owner.name)){
                            if(!u.isEmpty(_meta.owner.id)){
                                return true;
                            }}}}}}}

    if(! _meta.owner) _meta.owner = {};

    if(! _meta.owner.name){
        _meta.owner.name = get_name(_meta);
    }

    if(! _meta.owner.id){
        _meta.owner.id = guess_id(_meta);
    }
}



// not needed any more 2016 0311
function get_root_name(_meta, callback) {
    var guess, owner;

    owner = get_name();

    if (owner) {
        return user_module.get_user_id(owner, callback);
    }
    guess = _meta.path.split("/")[0];
    return callback(null, guess);
}

    _get_owner_obj = function(callback) {
        var name, user;
        name = get_name();
        if (name) {
            user = avatar.make_user_obj(name);
            avatar.make_user_obj(name, function(user) {
                user.init(callback);
            });
        } else {
            callback(null);
        }
    };
