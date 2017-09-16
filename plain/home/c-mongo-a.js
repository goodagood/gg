
var assert = require("assert");
var async  = require("async");
var u      = require("underscore");

var user   = require("../users/a.js");

var p = console.log;

function check_home_ids(){
  user.get_user_names(function(err, names){
    //console.log(typeof names);
    //console.log(u.isArray(names));
    //console.log(names.join(', '));

    names.sort();
    console.log('length: ', names.length);
    console.log(names.join(', '));
    assert(u.isArray(names));
    u.each(names, function(name){
        user.get_user_id(name, function(err, id){
            if(err) p('Error, 1, ', err, id);
            p(name, '\t', id);
            user.find_by_user_name(name, function(err, user_info){
                p('find by user name: ');
                p(err, user_info);
            });
        });
    });
    setTimeout(process.exit, 5500);
  });
}

// port forwarded, 2016 0412
var gg_user_db = 'mongodb://localhost:27017/gg';
var user_coll  = 'users';

function clone_to_mongo(){
  user.get_user_names(function(err, names){
    names.sort();
    console.log('length: ', names.length);
    console.log(names.join(', '));

    var url = gg_user_db;
    // Use connect method to connect to the Server
    MongoClient.connect(url, function(err, db) {
        if(err) return p('mongo connect err: ', err);

        if(!o) this.o={}; o.db = db;
        var collection = db.collection(user_coll);

        async.each(names, function(user_name, callback){
            one_user(collection, user_name, callback);
        }, function(err, results){
            if(err) return p('async each err: ', err);

            p('results:');
            p(results);
            db.close();
        });
    });

  });
}

function one_user(collection, user_name, callback){
    user.find_by_user_name(user_name, function(err, user_info){
        if(err) return callback(err);

        p('find by user name: ', user_info);
        //p(err, user_info);
        p(' Insert it');
        collection.insertOne(user_info, callback);
    });
}


/*
 * Change the field name 'id' to 'userid'
 */
function id2userid(){
    var url = gg_user_db;
    MongoClient.connect(url, function(err, db) {
        if(err) return p('mongo connect err: ', err);

        if(!o) this.o={}; o.db = db;
        var collection = db.collection(user_coll);

        var cursor = collection.find({});
        cursor.forEach(function(doc){
            p('doc id: ', doc.id, doc["_id"]);
            collection.updateOne({"_id": doc["_id"]},
                    {$set: {"userid": doc.id}});
        });

        setTimeout(function(){
            db.close();
            process.exit();
        }, 15500); // exit after 15.5sec

    });
}


function find_by_user_id(id){
    id = id || 'abc';
    var url = gg_user_db;
    MongoClient.connect(url, function(err, db) {
        if(err) return p('mongo connect err: ', err);

        if(!o) this.o={}; o.db = db;
        var collection = db.collection(user_coll);

        var cursor = collection.find({userid: id});
        o.coll = collection; o.cur = cursor;

        //setTimeout(function(){
        //    db.close();
        //    process.exit();
        //}, 15500); // exit after 15.5sec

    });
}


var MongoClient = require('mongodb').MongoClient;
var murl = 'mongodb://localhost:9017/test';
var name_of_collection = 'mar02y6';
var o = {};
var mdb;

function get_mongo(){

    // Connection URL
    var url = murl;
    // Use connect method to connect to the Server
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        mdb = db; //debug
        console.log("Connected correctly to server ", url);
        p('db.name: ', db.name);
    });
}

function  insertDocuments (db, callback) {
    // Get the documents collection
    var collection = db.collection('mar02y6');
    // Insert some documents
    collection.insertMany([
            {a : 1}, {a : 2}, {a : 3}
            ], function(err, result) {
                assert.equal(err, null);
                assert.equal(3, result.result.n);
                assert.equal(3, result.ops.length);
                console.log("Inserted 3 documents into the document collection");
                callback(result);
            });
}

function chk_mongo(){

    // Connection URL
    var url = 'mongodb://localhost:9017/test';
    // Use connect method to connect to the Server
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        mdb = db; //debug
        console.log("Connected correctly to server ", url);

        var insertDocuments = function(db, callback) {
            // Get the documents collection
            var collection = db.collection('mar02y6');
            // Insert some documents
            collection.insertMany([
                {a : 1}, {a : 2}, {a : 3}
                ], function(err, result) {
                    assert.equal(err, null);
                    assert.equal(3, result.result.n);
                    assert.equal(3, result.ops.length);
                    console.log("Inserted 3 documents into the document collection");
                    callback(result);
                });
        };


        p('db.name: ', db.name);

        p('going to close mongodb connection');
        db.close();
        setTimeout(process.exit, 5500);
    });
}


if(require.main === module){
    //check_home_ids();
    //chk_mongo();

    //clone_to_mongo();
    id2userid();
}
