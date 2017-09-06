var myutil = require('./myutil.js');

// define our function with the callback argument
function some_function(arg1, arg2, callback) {
   // this generates a random number between
   // arg1 and arg2
   var my_number = Math.ceil(Math.random() *
       (arg1 - arg2) + arg2);
   // then we're done, so we'll call the callback and
   // pass our result
   callback(my_number);
}

function fooa(arg1, arg2, callback) {
  myutil.waste_time(2);
   // this generates a random number between
   // arg1 and arg2
   var my_number = Math.ceil(Math.random() *
       (arg1 - arg2) + arg2);
   // then we're done, so we'll call the callback and
   // pass our result
   process.nextTick(function (){
     myutil.log('when');
     callback(my_number);
   });
}

function cba(){
  // callback function a
  console.log("callback a, function \n");
  console.log( util.inspect(arguments));
}

// call the function
// some_function(5, 15, function(num) {
//    // this anonymous function will run when the
//    // callback is called
//    console.log("callback called! " + num);
// });

// make a sequence
console.log("1.00\n");
fooa(5, 15, function(num) {
   // this anonymous function will run when the
   // callback is called
   console.log("callback called! " + num);
});

console.log("2.00\n");
console.log("3.00\n");

