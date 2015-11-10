var h = new Object(); // or just {}
h['one'] = 1;
h['two'] = 2;
h['three'] = 3;
h['four'] = 4;

// show the values stored
for (var k in h) {
  // use hasOwnProperty to filter out keys from the Object.prototype
  if (h.hasOwnProperty(k)) {
    console.log('key is: ' + k + ', value is: ' + h[k]);
  }
}

for (var k in h) {
  // use hasOwnProperty to filter out keys from the Object.prototype
  if (h.hasOwnProperty(k)) {
    console.log('key is: ' + k + ', value is: ' + h[k]);
  }
}

function ulstart(){
  var html = '';
  html += '<ul>'
}


// vim: set et sw=2 ts=2:
