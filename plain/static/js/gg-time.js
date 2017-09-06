
function group_number_by_comma (num_or_str){
    var rgx = /(\d+)(\d{3})/;
    var str = num_or_str.toString():
    while(rgx.test(str)){
        str = str.replace(rgx, "$1,$2");
    }
    return str;
}

function keep_digit(str){
    return str.replace(/\D/g, '');
}

function past_time(milli){
    // give the time in milli-seconds, seconds, easy-reading-str from the lock till now.

    if(typeof milli === 'string') milli = parseInt(milli);
    if(typeof milli !== 'number') throw new Error('not a number?');

    var d          = new Date(milli);
    var ms_now     = Date.now();
    var ms_one_day = 24 * 60 * 60 * 1000;
    var ms_7_day   =  7 * ms_one_day;

    var diff = ms_now - milli;

    var days, hrs, minutes, seconds, long_before;
    if(diff > ms_7_day) long_before = true;
    if(!long_before){
        var dd = new Date(diff);
        days   = dd.getDay();
        hours  = dd.getHour();
        minutes= dd.getMinutes();
        seconds= dd.getSeconds();
    }

    var parts = [days, 'Days', hours, 'Hrs',  minutes, 'Mins', seconds, 'Secs'];
    var timeStr = parts.join(' ') + ' Before';

    // get the first none zero time piece for short.
    var timeReg = /[1-9]\d*\D+\d*/;
    var shortTime = timeReg.exec(timeStr)[0];

    //var localDate = d.toLocaleFormat("%Y-%m-%d, %H:%M:%S, %Z");
    var iso = d.toISOString();

    //return [diff, seconds, str];
    return {
       ms_diff  : diff,
       iso      : iso,
       str_diff : timeStr,
       long_before : long_before,
    };
}


