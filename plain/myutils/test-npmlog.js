
function test_a(){
    var lm = require('./myloga.js');

    var log = lm.change_log_file('/tmp/alog');
    log.info('ok', Date());
}

function logb_old(){
    //var logb = require('./mylogb.js')('/tmp/logb');
    var logb = require('./mylogb.js')('/tmp/logb');
    console.log(logb);

    logb.info('abc');
}

function logb(){
    //var logb = require('./mylogb.js')('/tmp/logb');
    var log = require('./mylogb.js').simple_log('/tmp/logc');
    console.log(log);

    log(Date(), 'abc');
}

if(require.main === module){
    logb();
}


