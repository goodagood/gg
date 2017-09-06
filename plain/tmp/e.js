
var fn = function(){
  console.log(util.inspect(this));
}

var delay = 3;

var stid = setTimeout(fn, delay);
//– Initiates a single timer which will call the specified function after the
//delay. The function returns a unique ID with which the timer can be canceled
//at a later time.
//
//
//var siid = setInterval(fn, delay);
//– Similar to setTimeout but continually calls the function (with a delay
//every time) until it is canceled.
//
//clearInterval(siid); clearTimeout(stid);

//– Accepts a timer ID (returned by either of the aforementioned functions) and
//stops the timer callback from occurring.
