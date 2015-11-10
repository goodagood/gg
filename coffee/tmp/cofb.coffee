
class Animal
    constructor: (@name) ->

    move: (meters) ->
        console.log @name + " moved #{meters}m."

class Snake extends Animal
    move: ->
        console.log "Slithering..."
        super 5

class Horse extends Animal
    move: ->
      console.log "Galloping..."
      super 45

sam = new Snake "Sammy the Python"
tom = new Horse "Tommy the Palomino"

sam.move()
tom.move()

console.log "sam.name is: #{sam.name}"

###
String::dasherize = ->
    this.replace /_/g, "-"

console.log "dasherize _what_dash : ", "_what_dash".dasherize()
###

# vim: set et ts=2 sw=2 fdm=indent:
