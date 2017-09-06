outer = 1
changeNumbers = (a) ->
    a = a || -1
    outer = 10
    console.log 'here: ', outer
    inner = a
    #inner = changeNumbers()

a = changeNumbers(8, 9
)

console.log ("a is #{a}")
console.log outer
