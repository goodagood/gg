
"use strict";

// var sqlite3 = require('sqlite3').verbose();
var sqlite3 = require('sqlite3');

var fs = require('fs');
var path = require('path');
console.log(path.join(__dirname, '../config-mj.js'));
var config =   require("../config/config.js");

//console.log(config);  // git change branch cause app crash
//var dbname = 'local.sqlite3';
//var table_name = 'linfo';
var dbname = config.local_sqlite3;
var table_name = config.local_sqlite3_table_name;

var db = new sqlite3.Database(dbname);

function initdb(){
  db.serialize(function() {
    // In the table `linfo` (local information) we get:
    // name : the name
    // type 
    // milliseconds : Unix, milli-seconds from 1970,000... UTC, Date.now()
    // jsonobj : a json object to save most information.
    console.log("CREATE TABLE IF NOT EXISTS " + table_name +
      " (name TEXT, type TEXT, milliseconds INTEGER, jsonobj TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS " + table_name +
      " (name TEXT, type TEXT, milliseconds INTEGER, jsonobj TEXT)");

    //    var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    //    for (var i = 0; i < 10; i++) {
    //      stmt.run("Ipsum " + i);
    //    }
    //    stmt.finalize();
    //
    //    db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
    //      console.log(row.id + ": " + row.info);
    //    });
  });

}

function insert_file_info(name, type, json){
  if (typeof name !== 'string') return false;
  if (typeof type !== 'string') return false;
  if (typeof json === 'object') {
    // change it to json string
    json = JSON.stringify(json);
  }
  var milli = Date.now();
  var stmt = db.prepare("INSERT INTO " + table_name + " VALUES (?, ?, ?, ?)");
  stmt.run(
      name,
      type,
      milli.toString(),
      json);

  stmt.finalize();
//  for (var i = 0; i < 10; i++) {
//    stmt.run("Ipsum " + i);
//  }
}

function try_select(){

//  db.each("SELECT * FROM " + table_name, function(err, row) {
//    //console.log(row.id + ": " + row.info);
//    console.log(row);
//    console.log( typeof row);
//  });

  //db.get("SELECT * FROM " + table_name + " WHERE name = 'a1'",  function(err, row) {
  db.get("SELECT * FROM " + table_name ,  function(err, row) {
    if(err){
      console.log('failed');
      return 'failed';
    }

    if(typeof row === 'undefined'){
      console.log('row is undefined');
      return;
    }
    console.log(row);
//    console.log(row.id);
//    console.log(row.name);
//    console.log(row.type);
//    console.log( typeof row);
//    console.log(row.jsonobj);
//    console.log(typeof row.jsonobj);

  });

}

module.exports.insert_file_info = insert_file_info;
module.exports.initdb = initdb;


// During testing: 

// initdb();
// var jsontxt = JSON.stringify( {a:'haha', b:'toto'});
// insert_file_info('a1', 'test', jsontxt);
// 
// var jsontxt = JSON.stringify({a:'haha', b:'bb'});
// insert_file_info('b1', 'test', jsontxt);
// 
// try_select()
// db.close();

// Another way to run directly, as in python: if __name__ == "__main__":
var main = function (){
  console.log("initdb:");
  initdb();
  db.close();
}

if(require.main === module){
  //console.log(require);
  main();
}


// vim: set et ts=2 sw=2:

