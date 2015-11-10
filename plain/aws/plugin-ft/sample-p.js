
module.exports.description = exports.description  = 'sample file to test plugin and require all';

function can_be_used(meta){
    return false;
}

module.exports.a = exports.a  = 1;
module.exports.b = exports.b  = 2;



module.exports.can_be_used = exports.can_be_used  = can_be_used;
