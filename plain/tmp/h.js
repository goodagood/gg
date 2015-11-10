
var a = {};

a.a = 1;
a.b = 2;

a.foopar = function foopar(fa){
  if (typeof fa === 'undefined'){
    console.log("fa, undefined");
    return ;
  }
  console.log("fa= ", fa);
};

// you can create a function by passing the
// Function constructor a string of code
var func_multiply = new Function("arg1", "arg2", "return arg1 * arg2;");
func_multiply(5,10); // => 50


function listparam(){
  console.log("List arguments: ");
  for(var i = 0; i < arguments.length; i++){
    console.log(arguments[i]);
  }
}

(function (){
  console.log( {}.toString.call(arguments) );
})();


function ha(){
  console.log( {}.toString.call(arguments) );
}
