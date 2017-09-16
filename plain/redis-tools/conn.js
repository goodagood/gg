

const redis = require("redis");

/*
 * We forward local port 9379 to redis server, targeting the default:
 *  localhost:6379
 *
 *  I change it to default 27017, but it should be forward to remote's localhost:27017
 */
const port  = 9379; // not using


function make_redis_client(){
    const client = redis.createClient();

    return function(){
        return client;
    }
}
/*
 * We call the function "make redis client" and "export" the returned
 * function. 
 * Thuse we hide the redis client inside the function.
 */
const get_redis_client = make_redis_client();
module.exports.get_redis_client = get_redis_client;


if(require.main === module){
    var p = console.log;

    function c_keys(){
        var r = get_redis_client();
        r.keys("a*", function(err, akeys){
            p(err, akeys);
            setTimeout(process.exit, 2 * 1000);
        });
    }
    c_keys();


}

