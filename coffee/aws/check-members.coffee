
p = console.log
stop = () ->
    setTimeout process.exit, 500


members = require "./members.js"

test_dir = 'abc'


check_basic = ()->
    members_obj = members.make_members_obj(test_dir)
    members_obj.init_members_file().then(
        (what)->
            p "what? ", what
    )
    #p members_obj
    #members_obj.show_members_file()
    stop()

check_the_file = ()->
    members_obj = members.make_members_obj(test_dir)
    members_obj.show_members_file()
    stop()


if require.main is module
    #check_basic()
    check_the_file()

