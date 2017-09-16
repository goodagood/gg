/*
 * tmp file when checking mongodb  node.js driver.
 */
var updateDocument = function(db, callback) {
  // Get the documents collection
  var collection = db.collection(name_of_collection);
  // Update document where a is 2, set b equal to 1
  collection.updateOne(
          { a : 2 },
          { $set: { b : 1 } },
          function(err, result) {
                assert.equal(err, null);
                assert.equal(1, result.result.n);
                console.log("Updated the document with the field a equal to 2");
                callback(result);
  });  
};

var deleteDocument = function(db, callback) {
  // Get the documents collection
  var collection = db.collection(name_of_collection);
  // Insert some documents
  collection.deleteOne({ a : 3 }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Removed the document with the field a equal to 3");
    callback(result);
  });
};

var findDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection(name_of_collection);
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    assert.equal(2, docs.length);
    console.log("Found the following records");
    console.dir(docs);
    callback(docs);
  });
};



