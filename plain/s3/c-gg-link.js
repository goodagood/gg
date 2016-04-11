
/*
 * Check 'gg' link, which is root of js code,
 * 'gg' is a link in gg/plain/node_modules/, it's link to folder 'plain'
 */


var myutil  = require("gg/myutils/myutil")
var randstr = require("gg/myutils/rand-str")


if(require.main === module){
    console.log("require.main === module");

    console.log(myutil.get_uuid())
    console.log(randstr.random_str(8))
}
