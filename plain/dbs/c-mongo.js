
const mlog = require("./mong.logger.js");

    
MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server.");
    db.close();
});

mlog.


