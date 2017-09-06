// Make a <ul> tree view from object

var path = require('path');


function obj_to_key_value_list(obj){
    var list = [];
    if(obj){
        for( var k in obj){
            if(obj.hasOwnProperty(k)){
                list.push({name:k, value:obj[k]});
            }
        }
    }
    return list;
}


function make_ul_list(obj){
    // make an list (<ul> <li>...) from object.
    //var a = obj_to_key_value_list(obj);
    var html = "<ul>\n";
    if(obj){
        for( var k in obj){
            if(obj.hasOwnProperty(k)){
                html = html + '<li>';
                html = html + '<span class="glyphicon glyphicon-minusi"> </span>';
                html = html + '<span class="gname">' + 
                    '<a href="/ssrkey/' + obj[k] +  '">' + 
                    k + '</a> </span>';
                html = html + '</li>\n';
            }
        }
    }
    html = html + '</ul>';
    return html;
}


/*
 * Make a UL list from 'Contents' of AWS S3 getObjects data:
 *
{ Contents: 
   [ { Key: 'tmp/',
       LastModified: Tue Apr 15 2014 08:18:59 GMT+0000 (UTC),
       ETag: '"d41d8cd98f00b204e9800998ecf8427e"',
       Size: 0,
       Owner: [Object],
       StorageClass: 'STANDARD' },
     { Key: 'tmp/aa/',
       LastModified: Sat May 10 2014 06:23:10 GMT+0000 (UTC),
       ETag: '"d41d8cd98f00b204e9800998ecf8427e"',
       Size: 0,
       Owner: [Object],
       StorageClass: 'STANDARD' },
     { Key: 'tmp/aa/bb/',
       LastModified: Sat May 10 2014 06:23:10 GMT+0000 (UTC),
       ETag: '"d41d8cd98f00b204e9800998ecf8427e"',
       Size: 0,
       Owner: [Object],
       StorageClass: 'STANDARD' },

       ......

     { Key: 'tmp/mm',
       LastModified: Sat May 10 2014 06:21:37 GMT+0000 (UTC),
       ETag: '"36056b2a355b6bd8ad8963549a0d0329"',
       Size: 38237,
       Owner: [Object],
       StorageClass: 'STANDARD' },
     { Key: 'tmp/testmake/',
       LastModified: Sat May 10 2014 09:03:10 GMT+0000 (UTC),
       ETag: '"d41d8cd98f00b204e9800998ecf8427e"',
       Size: 0,
       Owner: [Object],
       StorageClass: 'STANDARD' } ]

       ......

 */
function make_ul_from_listObjects(contents){
    var html = "<ul>\n";
    if(contents){
        for (var i = 0; i < contents.length; i++){
            var fi = contents[i];  // file info

            html = html + '<li>';
            html = html + '<span class="glyphicon glyphicon-minusi"> </span>';
            html = html + '<span class="gname">';
            html = html + s3key_to_href(fi['Key']);
            html = html + '</span>';
            html = html + '</li>\n';
        }

    }
    html = html + '</ul>';
    return html;
}


function ends_with(string, suffix){
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
}


function s3key_to_href(s3key){
    // From s3 key, make an html <a> element.
    // If it's a file, make it downloadable stream.  If it's a `folder`, make it a
    // link to list contents.
    var html =  ''; '<a href="/ss/';
    if( ends_with(s3key, '/') ){
        html        += '<a href="/list/';
        html = html + s3key +  '">' + s3key + '</a>'; 
    }else{
        html        += '<a href="/ss/';
        html = html + s3key +  '">' + s3key + '</a>'; 
    }
    return html;
}


function folder_to_ul(data, prefix) {    
    var txt = '';
    if (typeof(data) === 'object') {
        if(!is_empty_object(data)){
            txt += '\n<ul>';
            for (var name in data) {
                var current_prefix = path.join(prefix, name)
                txt += '\n<li>' + make_a(name, current_prefix);
                txt += folder_to_ul(data[name], current_prefix);  // recursively
                txt += '</li>';
            }
            txt += '\n</ul>\n';
        }
    } else {
        txt +=  " : " + data;
    }
    return txt;
}


function make_a(words, href){
    return '<a href="' + href + '">' + words + '</a>';
}


function is_empty_object(obj){
    if (typeof(obj) !== 'object') return false;
    // empty object will get 0 keys:
    if (Object.keys(obj).length > 0) return false;
    return true;
}

function test_folder_to_ul(){
    var data =
    {
        "goodagood": {
            "etc": {
                "home-structure.json": "json file"
            },
            "public": {},
            "friends": {}
        }
    };

    console.log(folder_to_ul(data, '/treeview/'));
}


// tests

function test_obj_to_key_value_list(){
    var a = {a:1, b:2};
    var aobj = obj_to_key_value_list(a);
    console.log(aobj);
}

function test_make_ul_list(){
    var a = {a:1, b:2, c:"i am c"};
    var b = make_ul_list(a);
    console.log(b);
}


if( require.main === module ){
    // console.log('ok');
    // test_obj_to_key_value_list();
    //test_make_ul_list();
    test_folder_to_ul();
}


module.exports.make_ul_list = make_ul_list;
module.exports.make_ul_from_listObjects = make_ul_from_listObjects;
module.exports.folder_to_ul = folder_to_ul;
module.exports.is_empty_object = is_empty_object;
