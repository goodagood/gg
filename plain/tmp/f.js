
var delay = 1000;  //ms
var i = j = 0;

setTimeout(function(){
  /* Some long block of code... */
  wastTime(j);
  console.log('setTimeout arguments.callee' + j++ );
  //j = j++;
  if( j > 100){
    clearInterval(siid);
  }else{
    setTimeout(arguments.callee, delay);
  }
  
}, delay);

var siid = setInterval(function(){
  /* Some long block of code... */
  wastTime(i);
  console.log('setInterval' + i++ );
}, delay);

function wastTime(number){
  number ;
  for(var k =0; k < number; k++){
    k*k*k;
  }
  while(number > 1.0001){
    number = Math.sqrt(number);
  }
}
