
argv = require("yargs").argv

###
console.log process.argv
console.log "argv a: ", argv.a
console.log "argv b: ", argv.b
console.log 1, 2,
    3, 4, 5


setTimeout( 
    ->
        console.log 1, 2
      ,
      300
)



gold = silver = rest = "unknown"

awardMedals = (first, second, others...) ->
    gold   = first
    silver = second
    rest   = others

contenders = [
      "Michael Phelps"
      "Allyson Felix"
      "Shawn Johnson"
      "Roman Sebrle"
      "Guo Jingjing"
      "Tyson Gay"
      "Asafa Powell"
      "Usain Bolt"
]

awardMedals contenders...

console.log "Gold: " + gold
console.log "Silver: " + silver
console.log "The Field: " + rest


console.log name for name in [
      "Michael Phelps"
      "Allyson Felix"
      "Shawn Johnson"
      "Roman Sebrle"
      "Guo Jingjing"
      "Tyson Gay"
      "Asafa Powell"
      "Usain Bolt"
]

efoo = (->)

###


foo = (number = 8) ->
    console.log number

foo(9)
