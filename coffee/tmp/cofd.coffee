
class Folder
    constructor : (@name, @type) ->

    show_name : () ->
        console.log @name

    show_type : () ->
        console.log @type


f = new Folder('tmp', 'simple')

console.log f.name, f.type

f.name = 'another'
console.log f.name, f.type
