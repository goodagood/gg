var animals = [
  {species: 'Lion', name: 'King'},
  {species: 'Whale', name: 'Fail'}
];

for (var i = 0; i < animals.length; i++) {
  (function (i) { 
    this.print = function () { 
      console.log("\n#" + i  + ' ' + this.species + ': ' + this.name); 
    } 
    this.print();
  }).call(animals[i], i);
}


for (var i = 0; i < animals.length; i++) {
  (function (i) { 
    this.print = function () { 
      console.log("\n#" + i  + ' ' + this.species + ': ' + this.name); 
    } 
    this.print();
  }).apply(animals[i], [i,]);
}
