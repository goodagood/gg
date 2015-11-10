
var async   = require('async');
var Promise = require('bluebird');
var assert  = require('assert');
var u       = require('underscore');

var p = console.log;


function series(fun_list){
}

function get_run(first_callback, second){
    // first(err, result), is the original callback,
    // we wrap it and call the second.
    return function(err, result){
        first_callback(err, result);
        second();
    };

}

module.exports.get_run = get_run;


function pseries(funs){
    assert(u.isArray(funs), 'Suppose to get array of function, in pseries');

    var len = funs.length;
    if(len < 1){ return Promise.resolve('empty'); }


    var first_then_able = funs[0]();
    chain(1, first_then_able);

    function chain(i, previous){
        if(typeof i !== 'number'){
            return Promise.reject('not a number');
        }

        if(! u.isFunction(previous.then)){
            //return Promise.reject('not a then-able');
            return previous;
        }


        if(i<len){
            // then it:
            var next = previous.then(function(){
                return funs[i]();
            });

            chain(i+1, next);

        }
        else{
            return previous;
        }

    }

}

module.exports.pseries = pseries;

// checkings

function send_out_callback(callback){
    if(! u.isFunction(callback)){ throw new Error('can you give me a callback function'); }
    var random = Math.random();
 
    setTimeout(function(){
        callback(null, 'wow');
    },
    random * 1000);
}

function tmp(){
    
}

var promise_to_send_out_callback = Promise.promisify(send_out_callback);

function check_pseries_b(){
    function cb(){
        p('you are in cb. ', Date());
    }

    pseries([
            promise_to_send_out_callback,
            promise_to_send_out_callback
            ]);
}

function check_simple_then(){
    send_out_callback(function(){
        p('i am here, 12 31');
    });
}


function foo(num, callback){
    p(num);
    callback(null, num);
}

function something(){
    p('I am somehting');
}

function check_a(){
    foo(3, get_run(
                function(err, what){ p('show err, what: ', err, what); },
                something)
       );
}

//?1
function apromise(seconds){
    setTimeout(Promise.resolve, seconds*1000);
}

//?1
function check_promise_series(){
    var a = [1,2,3,4,5,6];
    var funs = a.map(function(num){
        return function(){
            apromise(num);
        };
    });
    pseries(funs);
}

function delay1(seconds){
    seconds = seconds || 2;
    p('in delay 1', Date.now());
    return Promise.delay(seconds * 1000);
}

function delay2(seconds){
    seconds = seconds || 2;
    p('in delay 2', Date.now());
    return Promise.delay(seconds * 1000);
}
//delay2.then = function(){return Promise.resolve('in delay2.then');};

function check_pseries_a(){
    pseries([delay1, delay2, delay2]);
}

function async_as_series(){
    // this not work, it needs callback
    async.series ([delay1, delay2, delay2]);
}

function waterfall(tasks) {
    finalTaskPromise = tasks.reduce(
            function(prevTaskPromise, task) {
                return prevTaskPromise.then(task);
            },
            Promise.resolve(false)   // initial value
    );

    return finalTaskPromise;
}

function check_waterfall(){
    waterfall([delay1, delay2, delay2]);
}


function promiseParallel(tasks) {
    var results = [];
    taskPromises = tasks.map(function(task) {
        return task();
    });

    return when.all(taskPromises);
}

function my_parallel(tasks){
    var funs = tasks.map(function(task){
        // build a function to hold each task, then the function will callback
        function converted(callback){
            task().then(function(got){
                callback(null, got);
            });
        }
        return converted;
    });

    if(! u.isFunction(callback)) callback = function(){};
    async.parallel(funs, callback);
}

function promise_all(){
    // This shows Promise.all will take promise to be fulfilled
    // But before this point, I don't know it need promise in the array.
    Promise.all([ delay1(1), delay2, 3, arrange_a_promise() ]).then(function(what){p(what);});
}

function arrange_a_promise(){
    var time = 3000;
    p('in function "arrange_a_promise"');
    return new Promise(function(resolve){
        setTimeout(function(){
            p('be set time out for: ', time);
            return resolve(time);
        },
        time);
    });
}

function check_arrange_a_promise(){
    // This shows 'promise' get run out, before 'then' been called.
    // Of course, if we need value, the value need past by then.
    //
    // One more question, is 'promise style' reliable?
    //

    var a = arrange_a_promise();
    p(1, typeof a);
    p(2, a);
    p(3, u.isFunction(a.then));
}

if(require.main === module){
    //check_a();
    //check_simple_then();
    //check_pseries_a();
    //check_pseries_b();
    //async_as_series();

    //arrange_a_promise();
    check_arrange_a_promise();
    //check_waterfall();
    //promise_all();
}

