
assert = require('assert')

file_list = require('../hrouters/file-list-v1.js')

p = console.log

user_names = ['abc', ]

user_name  = user_names[0]

describe "test-file-list.coffee, ", ->
    #
    #it "should get file list in html, ", (done) ->
    #    file_list.ls_for_owner user_name, (err, html) ->
    #        p err, html
    #        assert typeof html is 'string'
