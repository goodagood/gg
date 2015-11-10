###
# The file used to pass messages
#
# change 0105, 
#   split into: compose_msg and receive_msg from old write_msg_file, which
#     use text file; the new two use msg file obj.
# 
###


path    = require 'path'
util    = require 'util'
Promise = require('bluebird')
u       = require("underscore")
assert  = require('assert')
async   = require('async')

file_module   = require("./simple-file-v3.js")
folder_module = require("./folder-v5.js")
json_file     = require "./simple-json.js"

user_module   = require("../users/a.js")

myutil        = require('../myutils/myutil.js')
myconfig =  require("../config/config.js")

p = console.log

new_msg_file_obj = (file_meta, pass_out_object) ->
    # This will give a msg file object, it has functionalities,
    # set the meta as past in. But do nothing to change data.
    # The msg file obj is based on json file obj, the msg is json obj.
    json_file.new_json_file_obj(file_meta, (err, jobj)->
        return pass_out_object(err, jobj) if err

        Obj = jobj
        # Global data in this function:
        Meta = jobj.get_meta()
        Err  = ''
        Msg  = {}

        Template_a = """
            <li><span class="glyphicon glyphicon-leaf"></span> 
                <span class="username"><%=from%> </span>
                <span class="glyphicon glyphicon-send"></span>
                <span class="username"><%=to%> </span>:

                <ul class="file-info list-unstyled">
                    <li><div class="well message ">
                            <%=text%>
                    </div></li>

                    <li>
                        <input type="checkbox" name="filepath[]"
                            value="<%=pathuuid%>" />
                        <a href="/fileinfo-pathuuid/<%=pathuuid%>" class="file-info-link">
                                <%=filename%>
                        </a>
                    </li>
                    <li>Fri Jul 10 2015 06:43:38 GMT+0000 (UTC)</li>
                </ul>

            </li>
        """
        template_a = u.template(Template_a)

        render_html_repr = ()->

            # Note: it has no callback
            #
            # Results will be saved to Meta.html.li, it represent the file in web page
            #

            if u.isEmpty(Msg) or u.isNull(Msg) or not Msg
                err = new Error('Has no Msg json, ' + Meta.path)
                throw err

            #text = Msg.message # the old attribute name of msg content
            text = Msg.text
            text = "WoW! Message Contents must go to no-where." if not text? or not text
            #console.log(Msg); console.log(text)

            context = {text:text, filename:Meta.name, pathuuid:Meta.path_uuid}
            context.to = Msg.to
            context.from = Msg.from

            li = template_a(context)

            if not Meta.html?
                Meta.html = {}
            Meta.html.li = li
            return li

        render_html_repr_old = ()->

            # Note: it has no callback
            #
            # Results will be saved to Meta.html.li, it represent the file in web page
            #

            if u.isEmpty(Msg) or u.isNull(Msg)
                err = new Error('Has no Msg json, ' + Meta.path)
                throw err

            #text = Msg.message # the old attribute name of msg content
            text = Msg.text
            text = "WoW! Message Contents must go to no-where." if not text? or not text
            #console.log(Msg); console.log(text)

            # first, from whom:
            li = '<li><span class="glyphicon glyphicon-leaf"></span> &nbsp;\n'
            if ( Msg.from is Meta.owner) # this is msg sender
                li  += '<span class="glyphicon glyphicon-send"> <span class="username">' +
                    "#{Msg.to} </span>:\n"
            else # this should be msg receiver
                li  += '<span class="username">' + " #{Msg.from} </span>:\n"

            li    += '<ul class="file-info list-unstyled">'

            # sub list: the content:
            li    +=  '<li><div class="well message ">\n'
            li    +=  text
            li    +=  '</div></li>\n'

            # reply to:
            li    += '<li><span class="glyphicon glyphicon-share"></span> &nbsp;'
            li    += '<a class="reply-to" data-i18n="reply-to" href="/msgto/' + Msg.from + '">'
            li    += 'Reply to &nbsp; <span class="username badge">' + Msg.from + '</span></a></li>\n'


            # filename
            li    += '<li>'
            li += '<input type="checkbox" name="filepath[]" value="' + Meta['path'] + '" />&nbsp;'
            li    +=  Meta.name + '&nbsp;</li>\n'

            # and more:
            remove = util.format('<li> <a href="%s">' +
                '<span class="glyphicon glyphicon-trash"> </span>' +
                '&nbsp; delete &nbsp;</a></li>\n' , Meta['delete_href'] )

            li    += remove
            li    +=  '<li>' + new Date(parseInt(Msg.timestamp)) + '</li>\n'
            li    += '</ul></li>\n'

            if not Meta.html?
                Meta.html = {}
            Meta.html.li = li
            #callback(li)
            return li
            
        fetch_msg_json = (callback)->
            Obj.read_to_string(
                (err, str)->
                    j = JSON.parse(str)
                    Msg = j
                    callback(null, j)
            )

        get_msg_text = (callback)->
            if not u.isEmpty Msg
                if Msg.text?
                    return callback(null, Msg.text)
                else
                    callback('no text in Msg : "get msg text"', null)
            else
                fetch_msg_json (err, msg)->
                    p('fetch msg json in get msg text:', msg)
                    Msg = msg
                    if Msg.text?
                        return callback(null, Msg.text)
                    else
                        return callback('no text after fetched msg', null)



        # Set up the Obj and pass out it (callback)
        Obj.version          = 'simple msg coffee'


        Obj.render_html_repr_old = render_html_repr_old
        Obj.render_html_repr = render_html_repr

        Obj.fetch_msg_json   = fetch_msg_json
        Obj.get_msg_text     = get_msg_text

        pass_out_object(null, Obj)
    )



promised_new_msg_file_obj = Promise.promisify(new_msg_file_obj)


# Function, `new msg file from meta`, can be used by `s3-file-types.js`,
#            'file obj from meta'.
#
# Follow 'collector' rule, meta to file object, pass file object to callback.
#
# This assume the meta is for new message, and the json data is already saved
# to s3, key is: meta.storage.key
#
# It also assume the meta could be not complete, so it will calculate the
# defaults for it.
#
# This means msg is uploaded, it happens less, but all file can be uploaded.
#
new_msg_file_from_meta = (meta, callback)->
    new_msg_file_obj(meta, (err, mobj)->
        #p 'mobj object: ', mobj
        #mobj.upgrade_to_s3storage_collection()

        mobj.calculate_meta_defaults()
        mobj.fetch_msg_json( (err, json)->
            mobj.render_html_repr()
            #p 'html: ', info.html.li
            mobj.save_meta_file (err, reply) ->
                p 'new from meta, save meta FILE, (err, reply): ', err, reply
                callback err, mobj
        )
    )


compose_msg = (from, to, text, callback)->
    # prepare a msg file, only for sender, receiver is not considered.
    # @from: who/user-name send the msg
    
    if(u.isEmpty(from) || u.isEmpty(to))
        err = 'empty sender or receiver when compose message.'
        return callback(err, null)
    json = {
        from : from
        to   : to
        text : text
        uuid : myutil.get_uuid() #the uuid is going to be used by 2, to/from.
        timestamp : Date.now()
    }
    json.to = json.to.join(' ')  if(u.isArray(json.to))

    # To 'to'
    #owner = json.to
    owner = json.from # send v receive
    # dir : user/goodagood/message --> user_id/goodagood/message, 0514
    user_module.get_user_id(owner, (err, id)->
        dir   = path.join(id, myconfig.message_folder)

        file_name = "To_#{json.to}_#{json.timestamp}.ggmsg"  # send v receive
        file_path = path.join(dir, file_name)

        json_to_msg_file(json, owner, file_path, callback)
    )


json_to_msg_file = (json, owner, file_path, callback)->
    json_file.make_json_file(json, owner, file_path, (err, file)->
        meta = file.get_meta()
        new_msg_file_obj(meta, (err, msg_obj)->
            msg_obj.fetch_msg_json (err, json)->
                li = msg_obj.render_html_repr()

                #p 'in "msg as json" ', err, json
                #p 'in "msg as json", li ', li

                _meta = msg_obj.get_meta()
                #p 'get meta: html.li\n', _meta.html.li
                assert( li is _meta.html.li)
                #msg_obj.set_meta(_meta)
                #callback()

                msg_obj.save_file_to_folder().then((what)->
                    callback(null, msg_obj)
                )
        )
    )



receive_msg = (from, to, text, callback)->
    # @from: who/user-name send the msg
    
    if(u.isEmpty(from) || u.isEmpty(to))
        err = 'empty sender or receiver when receive message.'
        return callback(err, null)
    

    json = {
        from : from
        to   : to
        text : text
        uuid : myutil.get_uuid() #the uuid is going to be used by 2, to/from.
        timestamp : Date.now()
    }

    #owner = json.to
    owner = json.to # send v receive
    # dir : user/goodagood/message
    #dir   = path.join(owner, myconfig.message_folder)
    user_module.get_user_id(owner, (err, id)->
        dir   = path.join(id, myconfig.message_folder)

        fname = "To_#{json.to}_#{json.timestamp}.ggmsg"  # send v receive
        file_path = path.join(dir, fname)

        json_to_msg_file(json, owner, file_path, callback)
    )

    #fname = "From_#{json.from}_#{json.timestamp}.ggmsg"  # send v receive
    #file_path = path.join(dir, fname)
    #json_to_msg_file(json, owner, file_path, callback)



to_multiple_receiver = (from, to_many, text, callback)->

    # Check parameters first:
    if(u.isEmpty(from) || u.isEmpty(to_many))
        err = 'empty sender or receiver when receive message.'
        return callback(err, null)
    if not u.isArray(to_many)
        err = 'we need array of username to do job, in ' + 'to multiple receiver from: ' + from
        return callback(err, null)
    # filter out empty:
    #p "before filter: ", to_many
    many = to_many.filter((i)->
        return not u.isEmpty(i)
    )
    p "after filter: ", many
    assert(many.length > 0, "there are should be >0 to send")

    # build one function to receive message for each one:
    funs = []
    u.each(many, (who)->
        funs.push((callback)->
            receive_msg(from, who, text, callback)
        )
    )
    assert(funs.length > 0, "there are should be >0 functions to send")

    # run the functions:
    async.parallel(funs, callback)



write_msg_file = (from, to, text, callback)->
    # wrtie message from to.
    # @from : user name, message sender
    # @to   : user name, message receiver

    callback = (->) if not u.isFunction(callback)

    compose_msg(from, to, text, (err, ret1)->
        #p 'send\n', err, ret1
        receive_msg(from, to, text, (err, ret2)->
            #p 'receive\n', err, ret2
            callback(err, [ret1, ret2])
        )
    )
    

get_first_msg = (username, callback)->
    Folder = null

    _folder_path = path.join(username, myconfig.message_folder)
    folder_module.retrieve_promisified_folder(_folder_path).then((folder) ->
        Folder = folder
        meta = folder.get_meta()
        uuid_list = Object.keys(meta.files)
        uuid_list[0]
    ).then (first) ->
        # 'first' is the first uuid of msg file.
        Folder.uuid_to_file_obj first, callback
      

#read_json_file = (full_path)->
#    dir      = path.dirname(full_path)
#    filename = path.basename(full_path)
#
#    folder_module.retrieve_folder(dir).then(
#        (folder)->
#            folder.read_text_file(filename)
#    ).then(
#        (txt)->
#            #p 'txt: ', txt
#            json = JSON.parse(txt)
#    )


module.exports.new_msg_file_obj = new_msg_file_obj
module.exports.write_msg_file = write_msg_file
module.exports.new_msg_file_from_meta = new_msg_file_from_meta
module.exports.get_first_msg = get_first_msg

# expose for testing:
module.exports.compose_msg = compose_msg
module.exports.receive_msg = receive_msg
module.exports.to_multiple_receiver = to_multiple_receiver

# # checkings: # #

p = console.log
stop = () ->
    setTimeout process.exit, 500

# parameters during checking
user1 = 'abc'
user2 = 'aa'

test_owner_name  = 'abc'
test_folder_name = 'abc'
test_json_file_name = 'test.json'
test_file_name   = 'txt25'

check_write_msg = ()->
    write_msg_file(user1, user2, '01/13, 16:22pm\nhi', (err, what)->
            p "what you got after 'check write msg'?\n", what
            stop()
    )


check_new_msg_from_meta = ()->

    meta = {
        "name": "To_aa_1417582119799.ggmsg",
        "path": "abc/goodagood/message/To_aa_1417582119799.ggmsg",
        "owner": "abc",
        "size": 154,
        "dir": "abc/goodagood/message",
        "timestamp": 1417582120069,
        "uuid": "97ac58d9-e0e5-4e6b-8e58-27e05ed9ee31",
        "meta_s3key": ".gg.new/abc/goodagood/message/97ac58d9-e0e5-4e6b-8e58-27e05ed9ee31",
        "initial_key": ".gg.new/abc/goodagood/message/97ac58d9-e0e5-4e6b-8e58-27e05ed9ee31",
        "s3key": ".gg.file/abc/goodagood/message/97ac58d9-e0e5-4e6b-8e58-27e05ed9ee31",
        "storage": {
            "type": "s3",
            "key": ".gg.file/abc/goodagood/message/97ac58d9-e0e5-4e6b-8e58-27e05ed9ee31"
        }
    }
    new_msg_file_from_meta meta, (err, obj)->
        p 'check new msg from meta, 1, (err, obj): ', err, obj
        obj.save_file_to_folder()
            .then ()->
                stop()
        #

check_receive_msg = ()->
    receive_msg('aa', 'abc', 'this from aa, 0106', (err, ret)->
        p 'in check receive msg', err, ret
        stop()
    )


if require.main is module
    check_write_msg()
    #check_new_msg_from_meta() #?

    #check_send_msg()
    #check_receive_msg()


