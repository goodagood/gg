
function wastTime(number){
  if (number < 1) number = 1.1 ;
  number = number * 1000;
  for(var k =0; k < number; k++){
    k*k*k;
  }
  while(number > 1.0001){
    number = Math.sqrt(number);
  }
}

// 3 functions, each do a lot useless calculation to waste time.

function sqrtmm(number){
  // waste thousand time more than sqrt_million.
  number = number * 1000;
  for(var i =2; i < number; i++){
    sqrt_million(i)
  }
}

function sqrt_million(number){
  // Do a lot calculation according to `number`, to waste time;
  // Multiply by a million
  number = number * 1000000;
  for(var i =2; i < number; i++){
    sqrt_to_1(i)
  }
}

function sqrt_to_1(number){
  // calculate square root till it's 1.
  while(number > 1.0001){
    number = Math.sqrt(number);
  }
  //return number;
}
