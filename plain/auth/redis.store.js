
const util = require('util');
//const debug = require('debug');

const redis = require("redis");

//?
var Store = require('express-session').Store;


module.exports.config_redis_store = config_redis_store;


var defer = typeof setImmediate === 'function' ?
    setImmediate :
    function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) };


function defer_callback(callback){
    if(typeof callback === 'undefined' || !callback) return noop;

    return function(){
        const args = arguments;
        defer(function(){
            callback.apply(callback, args);
        });
    };
}


var noop = function(){};


function config_redis_store (options){
    options = options || {};

    var storeObj = new Store(options);

    var prefix = 'rsess';
    if(options.hasOwnProperty('prefix')) prefix = options.prefix;

    //delete options.prefix;

    var serializer = JSON;
    if(options.hasOwnProperty('serializer')) serializer = options.serializer;

    var rclient; // redis client
    if(options.hasOwnProperty('client')) rclient = options.client;

    if(!rclient){
        if (options.hasOwnProperty('socket')) {
            rclient = redis.createClient(options.socket, options);
        }
        else {
            // normally give: host, port in options,
            // but there are many possibilities,
            // check 'redis' for other type of creation.
            // and this will give a client any way, as it will default to
            // 127.0.0.1:6379
            rclient = redis.createClient(options);
        }
    }


    if (options.hasOwnProperty('password') || options.hasOwnProperty('pass')){
        const _password = options.password || options.pass;

        rclient.auth(options.pass, function (err) {
            if (err) {
                throw err;
            }
        });
    }

    var ttl;
    if (options.hasOwnProperty('ttl')) ttl = options.ttl;

    var disableTTL;
    if (options.hasOwnProperty('disableTTL')) disableTTL = options.disableTTL;

    //if (options.unref) rclient.unref();

    if ('db' in options) {
        if (typeof options.db !== 'number') {
            console.error('Warning: connect-redis expects a number for the "db" option');
        }else{
            rclient.select(options.db);

            rclient.on('connect', function () {
                rclient.select(options.db);
            });
        }
    }


    rclient.on('error', function (er) {
        //console.log('Redis returned err', er);
        storeObj.emit('disconnect', er);
    });

    rclient.on('connect', function () {
        storeObj.emit('connect');
    });


    storeObj.get = (sid, cb) => {
        var psid = prefix + sid;
        cb = defer_callback(cb);

        //console.log('GET "%s"', sid);

        rclient.get(psid, function (er, data) {
            if (er) return cb(er);
            if (!data) return cb();

            var result;
            data = data.toString();
            //console.log('GOT %s', data);

            try {
                result = serializer.parse(data);
            }
            catch (er) {
                return cb(er);
            }
            return cb(null, result);
        });
    };


    /**
     * Commit the given `sess` object associated with the given `sid`.
     *
     * @param {String} sid
     * @param {Session} sess
     * @param {Function} callback
     * @api public
     */

    storeObj.set = (sid, sess, callback) => {

        callback = defer_callback(callback);

        var args = [prefix + sid];

        try {
            var jsess = serializer.stringify(sess);
        }
        catch (er) {
            return callback(er);
        }

        args.push(jsess);

        if (disableTTL) {
            var ttl = getTTL(sess, ttl); //?
            args.push('EX', ttl);
            //console.log('SET "%s" %s ttl:%s', sid, jsess, ttl);
        } else {
            //console.log('SET "%s" %s', sid, jsess);
        }

        //rclient.set(args, callback);
        rclient.set(args, function (er) {
            if (er) return callback(er);
            //console.log('SET complete');
            callback.apply(null, arguments);
        });
    };


    /**
     * Destroy the session associated with the given `sid`.
     *
     * @param {String} sid
     * @api public
     */

    storeObj.destroy = (sid, callback) => {
        callback = defer_callback(callback);

        sid = prefix + sid;
        //console.log('DEL "%s"', sid);
        rclient.del(sid, callback);
    };


    /**
     * Refresh the time-to-live for the session with the given `sid`.
     *
     * @param {String} sid
     * @param {Session} sess
     * @param {Function} fn
     * @api public
     */

    storeObj.touch = (sid, sess, callback) => {
        callback = defer_callback(callback);

        var psid = prefix + sid;
        if (disableTTL) return callback();

        var ttl = getTTL(sess, ttl);

        //console.log('EXPIRE "%s" ttl:%s', sid, ttl);
        rclient.expire(psid, ttl, callback);
        //rclient.expire(psid, ttl, function (er) {
        //    if (er) return callback(er);
        //    console.log('EXPIRE complete');
        //    callback.apply(this, arguments);
        //});
    };




    return storeObj;
}



var Seconds_in_day = 24 * 60 * 60;

function getTTL(sess, default_ttl) {
  var maxAge = sess.cookie.maxAge;
  return default_ttl || (typeof maxAge === 'number'
    ? Math.floor(maxAge / 1000)
    : Seconds_in_day);
}
