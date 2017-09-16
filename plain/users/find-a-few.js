
var people     = require("./people.js");

function known_names(username){
    // Promise style must be 'returned':
    return people.make_people_manager_for_user(username).then(function(man){
        return man.get_a_few();
    });
}


module.exports.known_names = known_names;


if(require.main === module){
    
    known_names('abc').then(function(names){
        console.log(names);
        process.exit();
    });
}

