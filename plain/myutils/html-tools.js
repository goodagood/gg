

var jade      = require("jade");
var multiline = require("multiline");
var u         = require("underscore");

var p         = console.log;


// user_name : input variable
const one_checkbox = multiline(function(){/*
label(for="username")
    input(type="checkbox", name="username", value=user_name)
    span(class="username")
        = user_name
*/});

var jade_one_checkbox = jade.compile(one_checkbox);





function names_to_checkbox(names){
  var checkboxs = u.map(names, function(one){
      return jade_one_checkbox({user_name: one});
  });

  return checkboxs.join("\r\n");
}


module.exports.names_to_checkbox = names_to_checkbox;


if(require.main === module){
    //p(jade_one_checkbox({user_name: 'tmpe=user'}));

    p(names_to_checkbox(['abc', 'andrew']));
}

