var util = require('util');
var fs   = require('fs');

// print details of object, when `console.log` is not enough.
// p  : console.log the inspected
// pf : log the inspect object information to file

function p(obj){
    var a = util.inspect(obj, {depth:null, showHidden:true});
    console.log(a);
}

function pf(obj, filename){
    var head = '\n--- --- ' + Date().toString() + '\n';
    var a = util.inspect(obj, {depth:null, showHidden:true});
    var out = head + a + '\n';

    fs.writeFile(filename, out);
}



function simple_date(){
    //
    // Return a string as simple date: 
    // (dat_of_month)-(hours):(minutes):(seconds).(milli seconds)
    //
    var d = new Date();
    var day_of_month = d.getDate().toString(); 
    var hours = d.getHours().toString(); 
    var minutes = d.getMinutes().toString(); 
    var seconds = d.getSeconds().toString(); 
    var mili = d.getMilliseconds().toString(); 
    var result = day_of_month + '-' + hours + ':' + minutes + ':' + seconds +
        '.' + mili;
    return result;
}

function all_date_parts_from_milli(miliseconds_or_string){
    //
    // Return a string as simple date: 
    // (year)-(month)-(day)-(hours):(minutes):(seconds).(milli seconds)
    //
    var milli = miliseconds_or_string;
    if(typeof miliseconds_or_string === 'string') milli = parseInt(miliseconds_or_string);

    var d = new Date(milli);

    var year = d.getFullYear().toString(); 
    var month= (d.getMonth() + 1).toString(); // getMonth return 0-11
    var day = d.getDate().toString(); 

    var hours = d.getHours().toString(); 
    var minutes = d.getMinutes().toString(); 
    var seconds = d.getSeconds().toString(); 
    var mili = d.getMilliseconds().toString(); 
    var result = year + '-' + 
        month + '-' +
        day + '-' +
        hours + ':' + minutes + ':' + seconds +
        '.' + mili;
    return result;
}

function seconds_past_today(){
    //
    // Return a string of seconds past today
    //
    var d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);

    var milli = Date.now() - d.getTime();

    var sec   = Math.floor(milli / 1000);
    return sec.toString();
}


exports.p = p;
exports.pf = pf;
