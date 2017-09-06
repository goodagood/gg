

avatar = require('./avatar.js')
p = console.log

exit  = () ->
    setTimeout(process.exit, 1000)

check_new_user_obj = (username) ->
    avatar.make_user_obj username, (user) ->
        console.log(user)
        return exit() if not user
        user.get_attr null, (err, attrs) ->
            console.log(err, attrs)
            exit()

#check_new_user_obj 'abc'


check_init_flag = (username) ->
    avatar.make_user_obj( username, (user) ->
            user.init_flag( (what) ->
                p('what', what)
                exit()
            )
    )

#check_init_flag('abc')


check_user_attr = (username) ->
    avatar.make_user_obj username, (user) ->
        console.log(user)
        return exit() if not user
        user.get_attr null, (err, attrs) ->
            console.log(err, attrs)
            exit()

#check_user_attr('abc')


check_attr  = (username) ->
    avatar.make_user_obj( username, (user) ->
            user.pass_attr( (err, what) ->
                p('err, what: ', err, what)
                exit()
            )
    )

#check_attr ('abc')


check_flag_up  = (username, flag_name) ->
    avatar.make_user_obj( username, (user) ->
            user.flag_up  'test-flag',  (ok, flag_down) ->
                p 'flag supposed to be upped'
                user.show_flags(->)
                flag_down() if(ok)
                user.show_flags( (err, info)->
                    p 'it should donw'
                )
                exit()
            
    )

#check_flag_up()


show_flags  = (username) ->
    avatar.make_user_obj( username, (user) ->
            user.show_flags (err, results) ->
                p err, results
                exit()
    )

#show_flags('abc')


del_flag  = (username, flag_name) ->
    avatar.make_user_obj( username, (user) ->
            user.del_flag(flag_name, (err, results) ->
                p err, results
                user.show_flags (->)
                exit()
            )
    )

del_flag('abc', 'abc')

