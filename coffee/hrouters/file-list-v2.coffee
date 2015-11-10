
# Adapting from js version


util = require("util")
path = require("path")
async= require "async"
u    = require("underscore")

markdown = require("markdown").markdown
cel = require("connect-ensure-login")

myuser = require("../myuser.js")
tv = require("../myutils/tv.js") #?
myutil = require("../myutils/myutil.js")

# most normal configurations put here.
myconfig =  require("../config/config.js")

bucket = require("../aws/bucket.js")
meta = require("../aws/meta.js")
folder_module = require("../aws/folder-v5.js")
listor = require("../aws/listor.js")

deliver = require("../aws/file-deliver.js")
social = require("../aws/social.js") #?
mytemplate = require("../myutils/template.js")
log28 = require("../myutils/mylogb.js").double_log("/tmp/log28")

people = require("../users/people.js")
css_file = require("../aws/css-file.js")
htool  = require("./html-tools.js")

p = console.log

# 0525, routes to list files
#
list = (app) ->
  
    # 0816, 0116, testing by hand
    app.get /^\/ls-0203\/(.*)/, cel.ensureLoggedIn("/login"), (req, res, next) ->
      cwd = req.params[0]
      username = req.user.username
      id       = req.user.id
      #cwd = username  if typeof cwd is "undefined" or not cwd #dir anyway.
      cwd = id  if typeof cwd is "undefined" or not cwd #dir anyway.
      
      #p('in "get/ls..." username, cwd in ls', [username, cwd])
      ls_for_username username, cwd, (err, html) ->
          res.send html
  
    # 0928 2015
    ls_anyway = require('./ls-anyway.js')
    app.get /^\/ls-anyway\/(.*)/, cel.ensureLoggedIn("/login"), (req, res, next) ->
      cwd = req.params[0]
      username = req.user.username
      id       = req.user.id
      cwd = id  if typeof cwd is "undefined" or not cwd #dir anyway.

      params = {
        username: username,
        cwd:      cwd,
        id:       id
      }
      
      ls_anyway.list_folder_anyway params, (err, html) ->
          res.send html

    myel = require("../login/ensure-login.js")
    # no more ensure login, folder control it's members and viewers, y15m7d19
    #app.get /^\/ls\/(.*)/, myel.ensure_login("/login"), (req, res, next) 
    app.get /^\/ls\/(.*)/, (req, res, next) ->
        cwd = req.params[0]

        username = id = undefined
        if req.user? and req.user
            username = req.user.username
            id       = req.user.id
            cwd = id  if typeof cwd is "undefined" or not cwd #dir anyway.
        #p 'in ls: ', username, cwd
        #err = '<h1>We are trying to find who who</h1>' if not username? or not username
        #return res.end(err) if err

        p('in "get/ls..." username, cwd in ls', [username, cwd])
        #list_style  username, cwd, (err, html) -->>
        #list_tmp  username, cwd, (err, html) -->>
        #listor.temporary_list  username, cwd, (err, html) ->
        listor.interface_listor  username, cwd, (err, html) ->
            #p('in get ls, after "listor...", err html:\n', err, html)
            # pop err:
            html = "<h1>we got err in 'interface listor' when 'get ls'.</h1>" if err
            res.send html


    # 2015 0924, make a direct url to read user index.html file for folder
    index_file = require("../aws/index-file.js")
    app.get /^\/index-html\/(.*)/, (req, res, next) ->
      cwd = req.params[0]
      return res.send('<h1> unknow cwd </h1>') if(!cwd)

      username = null; 
      username = req.user.username if (req.user?)

      params = {
        cwd:      cwd
        username: username
      }
      index_file.read_folder_index_file_to_string(params, (err, html)->
        return res.end('read folder index.html err') if(err)
        res.send html
      )

  
    # can we add file value? doing. redo for muji gold show.
    # adding value of files, list style, 0309
    ls3 = require('./ls3.js')
    app.get /^\/ls211\/(.*)/, cel.ensureLoggedIn("/login"), (req, res, next) ->
      cwd = req.params[0]
      username = req.user.username

      # dirty hard-wire to make sure: username, cwd exists.
      err = '<h1>We are trying to find who who</h1>' if not username? or not username
      return res.end(err) if err
      cwd = username  if typeof cwd is "undefined" or not cwd #dir anyway.
      
      ls3.assemble_file_list  username, cwd, (err, html) ->

          # pop err:
          html = "<h1>some thing wrong in hand written list style.</h1>" if err
          res.send html

    # Trying again, it's to give a listing anyway, 2015, 0502.
    lsaw = require('./ls-anyway.js')
    app.get /^\/ls0502\/(.*)/, cel.ensureLoggedIn("/login"), (req, res, next) ->
      opt = {
          username : req.user.username
          user_id  : req.user.id
          cwd      : req.params[0]
      }

      # dirty hard-wire to make sure: username, cwd exists.
      err = '<h1>We are trying to find who who</h1>' if not opt.username? or not opt.username
      return res.end(err) if err
      opt.cwd = '/'  if typeof opt.cwd is "undefined" or not opt.cwd #dir anyway.
      
      lsaw.give_folder_listing_parts  opt, (err, parts) ->
          p 'ls0502 ', err, parts.username, u.omit(parts, 'file_list_ul')
          return res.end("<h1>some thing wrong in getting parts, ls0502.</h1>") if err
          res.render "ls-2015-0502", parts

    # ... 0309
    # this return to a single handlebar template
    lsimg = require('./ls-img.js')
    app.get /^\/lsimg\/(.*)/, cel.ensureLoggedIn("/login"), (req, res, next) ->
      cwd = req.params[0]
      username = req.user.username

      # dirty hard-wire to make sure: username, cwd exists.
      err  = ''
      err += '<h1>We are trying to find who who</h1>' if not username? or not username
      cwd = username if not cwd? or not cwd
      err += '<h1>We can not find cwd</h1>' if not cwd? or not cwd
      return res.end(err) if err

      
      lsimg.make_ls_img_context  username, cwd, (err, context) ->

          # pop err:
          html = "<h1>some thing wrong in hand written list style.</h1>" if err
          res.render('ls-img', context)


    # try to make send file easy. 0219
    ls_send = require('./ls-send.js')
    app.get /^\/ls-send\/(.*)/, cel.ensureLoggedIn("/login"), (req, res, next) ->
      cwd = req.params[0]
      username = req.user.username

      # dirty hard-wire to make sure: username, cwd exists.
      err = '<h1>We are trying to find who who</h1>' if not username? or not username
      return res.end(err) if err
      cwd = username  if typeof cwd is "undefined" or not cwd #dir anyway.
      
      ls_send.assemble_file_list  username, cwd, (err, html) ->

          # pop err:
          html = "<h1>some thing wrong in hand written list style.</h1>" if err
          res.send html

  
    fileinfo = require("../myutils/fileinfo-a.js")
    # Get file information by: dir/uuid
    # Let's call it: puuid
    app.get /^\/fileinfo-pathuuid\/(.*)/, cel.ensureLoggedIn("/login"), (req, res, next) ->
        username = req.user.username
        puuid = req.params[0]
        return res.send('<h1> err, no path uuid</h1>') if(not puuid)

        dir = path.dirname(puuid)
        uuid = path.basename(puuid)
        return folder_module.retrieve_file_by_path_uuid(puuid, (err, file)->
            return res.send("<h1> file not found by p uuid</h1>") if(err)

            meta = file.get_meta()

            checked = ''
            checked = 'checked' if meta.unique
            context   = {
                info_list: file.build_file_info_list(),
                cwd:       dir,
                cwd_chain: path_chain(dir),
                username:  username,
                puuid:     puuid,
                unique_is_checked : checked,
            }
            res.render('fi-pu', context)
        )


  
    
    # 0725, what's the good way to do UI?  todo
    app.get /^\/message\/(.*)/, cel.ensureLoggedIn("/login"), (req, res, next) ->
      
      #res.end('testing s'); next();
      #console.log(0529-1); console.log((req.params[0]));
      cwd = req.params[0]
      username = req.user.username
      folder_module.retrieve_folder cwd, (folder) ->
        cwd_chain = path_chain(cwd, "/ls/") # '/ls/' is start of the href
        ul = folder.get_ul_renderring()
        res.render "ls",
          user: req.user
          username: req.user.username
          cwd: cwd
          cwd_chain: cwd_chain
          user_folder_ul: ul
  
        return
  
      return
  
    
    # this is testing 0613, to let user select and send files
    
    app.get /^\/list-msg\/(.*)/, (req, res, next) ->
      cwd = req.params[0]
      console.log "cwd"
      console.log cwd
      username = req.user.username
      cwd = path.join(username, "goodagood/.in")  if typeof cwd is "undefined" or not cwd
      console.log "cwd 2"
      console.log cwd
      
      # todo : make a list of files plus folders.
      #bucket.list_msg_folder(username, cwd, function(err, data){
      meta.get_file_list_in_folder cwd, (err, data) ->
        cwd_chain = path_chain(cwd, "/list-msg/") # '/list2/' is start of the href
        
        #console.log(data);
        res.render "list3",
          user: req.user
          username: req.user.username
          cwd: cwd
          cwd_chain: cwd_chain
          user_folder_ul: data
  
        return
  
      return
  
    
    # do the sending file, get parameters from url query string.
    app.get "/testsend", cel.ensureLoggedIn("/login"), (req, res, next) ->
      console.log "\n testsend \n"
      console.log req.query
      src = decodeURIComponent(req.query.src)
      target_user = decodeURIComponent(req.query.targetuser)
      
      #var target = path.join(target_user, 'goodagood/in');
      target = path.join(target_user, myconfig.message_folder)
      
      #console.log(src, '  ', target);
      deliver.copy_file src, target
      
      #res.send(JSON.stringify(req.query));
      res.json req.query
      next()
      return
  
    # not use this one?
    app.post "/save-file-list/", cel.ensureLoggedIn("/login"), (req, res, next) ->
      list_str = req.body.file_list_str
      file_list = JSON.parse(list_str)
      return
  
    
    # check and save to file list, todo, to check 29
    app.post "/send-file/", cel.ensureLoggedIn("/login"), (req, res, next) ->
        file_list_str = req.body.file_list_str
        file_list = JSON.parse(file_list_str)
        people_list_str = req.body.people_list_str
        people_list = JSON.parse(people_list_str)

        console.log "send-file post here\n", "file list:\n" , file_list, "people list:\n", people_list

        jobs_of_sending = []
        file_list.forEach (src_file) ->
            people_list.forEach (target_user) ->
                dir = path.join(target_user, myconfig.message_folder)
                p "to deliver with send file( ", [ src_file, target_user ]
                #deliver.copy_file src_file, dir

                send_one = (callback)->
                    deliver.send_file  src_file, target_user, dir, callback

                jobs_of_sending.push(send_one)

        async.parallel(jobs_of_sending, (err, reply)->
            if(err)
                res.json({err:true})
            else
                res.json({success:true})

            next()
        )
        # check and save to file list, todo?
  
    
    # add folder, 0529:
    app.get /\/add-folder\/(.*)/, cel.ensureLoggedIn("/login"), (req, res) ->
      
      #console.log(req.user);
      console.log "add-folder ..."
      console.log req.user.username
      
      # calculate current directory:
      current_dir = req.params[0]
      cwd_chain = path_chain(current_dir, "/ls/")
      console.log "current_dir"
      console.log current_dir
      res.render("add-folder",
          {
              user: req.user
              message: req.flash("error")
              current_dir: current_dir
              cwd_chain: cwd_chain
          }
      )
  
  
    app.post /\/add-folder\/(.*)/, (req, res) ->
      
      #console.log('add folder post...');
      cwd = req.params[0]
      username = req.user.username
      folder_name = req.body.folder_name
      
      #/ re-write:
      folder_module.retrieve_folder(cwd).then( (current_dir_obj) ->
          return current_dir_obj.add_folder(folder_name)
      ).then((new_folder)->
          res.redirect "/ls/" + cwd
      )
  
  
  
    
    #res.redirect('/ls/' + cwd);
    app.get /\/view\/(.*)/, (req, res, next) ->
      file_path = req.params[0]
      username = req.user.username
      console.log "view-- ", file_path
      
      #var ext = path.extname(file_path);
      #if( ext !== '.md' ) {res.end('not markdown file.'); next();}
      folder_module.retrieve_file_meta file_path, (meta) ->
        if meta.storage.type is "meta-text"
          text = meta.storage.text
          contents = markdown.toHTML(text)
          res.render "view",
            user: req.user
            message: req.flash("error")
            contents: contents
  
        
        #next(); // I am not sure if 'next()' could stop running the rest.
        if meta.storage.type is "s3"
          bucket.read_file meta.storage.key, (err, text) ->
            contents = markdown.toHTML(text)
            res.render "view",
              user: req.user
              message: req.flash("error")
              contents: contents
  
  

#next(); // I am not sure if 'next()' could stop running the rest.
ls_for_username = (username, cwd, callback) ->
    folder_module.retrieve_folder(cwd).then( (folder) ->
        return callback("?cwd: " + cwd)  unless folder
        folder.check_username username, (err, what) ->
            #p "check user name, what", what
            switch what
                when "owner"
                    ls_for_owner username, folder, callback
                when "member"
                    ls_for_owner username, folder, callback
                when "viewer"
                    ls_for_viewer username, folder, callback
                when "who-known"
                    ls_for_public username, folder, callback
                else
                    ls_for_public username, folder, callback
    )



ls_for_owner = (username, folder, callback) ->
    # folder : OBJECT of the folder

    meta = folder.get_meta()
    cwd = meta.path
    cwd_chain = myutil.path_chain(cwd, "/ls/") # '/ls/' is start of the href
    folder.give_ul_renderring  username, (ul) ->

        Man = {}
        people.make_people_manager_for_user(username).then((man)->
            Man = man
            #p('-- in men then\n')
            #p('man.Folder: ', man.Folder)
            #p 23456
            return Man.get_a_few()  # dropping
        ).then((current_people)->
            #p('-- in then here --')
            
            if u.isArray(current_people)
                current_people = htool.name_list_to_checkbox(current_people)
            current_people = "<p>error or chose people from <a href=\"/people\"> people</a></p>"  unless current_people

            css_file.read_css_file_of_folder(meta.path).then (css_as_string) ->
                #p 'In "ls for owner", css string:\n', css_as_string
                assemble_html_with_css(username, ul, cwd, cwd_chain,
                    current_people, css_as_string, (html) ->
                        callback null, html
                )
        )





ls_for_viewer = (username, folder, callback) ->
  meta = folder.get_meta()
  cwd = meta.path
  cwd_chain = myutil.path_chain(cwd, "/ls/") # '/ls/' is start of the href
  folder.give_ul_renderring username, (ul) ->
    
    # 
    assemble_folder_list_for_viewer username, ul, cwd, cwd_chain, null, callback
    return

  return
ls_for_public = (username, folder, callback) ->
  meta = folder.get_meta()
  cwd = meta.path
  cwd_chain = myutil.path_chain(cwd, "/ls/") # '/ls/' is start of the href
  folder.give_ul_renderring username, (ul) ->
    
    # 
    assemble_folder_listing_for_public username, ul, null, null, null, callback
    return

  return
assemble_folder_listing_for_public = (username, ul_file_list, cwd, cwd_chain, current_people, callback) ->
  contexts =
    body:
      user_folder_ul: ul_file_list
      cwd: cwd
      cwd_chain: cwd_chain
      current_people: current_people

    header:
      username: username

  
  #log28('user folder in ls86', ul);
  #log28('user name in ls86', username);
  #log28('cwd name in ls86', cwd);
  html_elements =
    body: "public-list.html"
    header: "goodheader.html"
    navbar: "empty.html"
    script: "empty.html"
    frame: "frame-a.html"

  mytemplate.assemble_html html_elements, contexts, (html) ->
    callback html
    return

  return
assemble_folder_list_for_viewer = (username, ul_file_list, cwd, cwd_chain, current_people, callback) ->
  contexts =
    body:
      user_folder_ul: ul_file_list
      cwd: cwd
      cwd_chain: cwd_chain
      current_people: current_people

    header:
      username: username

  
  #log28('user folder in ls86', ul);
  #log28('user name in ls86', username);
  #log28('cwd name in ls86', cwd);
  html_elements =
    body: "viewer-folder-list.html"
    header: "goodheader.html"
    navbar: "people-file-navtabs.html"
    script: "file-list-script.html"
    frame: "frame-a.html"

  mytemplate.assemble_html html_elements, contexts, (html) ->
    callback null, html
    return


# really tedious job, make change to use css, as: assemble html with css
assemble_html_for_listing = (username, ul_file_list, cwd, cwd_chain, current_people, callback) ->
  contexts =
    body:
      user_folder_ul: ul_file_list
      cwd: cwd
      cwd_chain: cwd_chain
      current_people: current_people

    header:
      username: username

  
  #log28('user folder in 88', ul_file_list);
  #log28('user name in ls86', username);
  #log28('cwd name in ls86', cwd);
  html_elements =
    body: "file-list.html"
    header: "goodheader.html"
    navbar: "people-file-navtabs.html"
    script: "file-list-script.html"
    frame: "frame-a.html"

  
  #mytemplate.assemble_html(html_elements, contexts, function(html){
  #  callback(html);
  #});
  mytemplate.assemble_html_v2(html_elements, contexts).then (html) ->
    callback html


assemble_html_with_css = (username, ul_file_list, cwd, cwd_chain, current_people, in_file_css, callback) ->
  contexts =
    body:
      user_folder_ul: ul_file_list
      cwd: cwd
      cwd_chain: cwd_chain
      current_people: current_people

    header:
      username: username

    frame:
      in_file_css: in_file_css

  
  html_elements =
    body: "file-list.html"
    header: "goodheader.html"
    navbar: "people-file-navtabs.html"
    script: "file-list-script.html"
    #frame: "frame-a.html"
    frame: "frame-b.html"
  
  mytemplate.assemble_html_v2(html_elements, contexts).then (html) ->
      #p 'html in "assemble html with css":\n', html
      callback html



isEmpty = (str) ->
    not str or 0 is str.length


# For checking if a string is blank, null or undefined:
isBlank = (str) ->
  not str or /^\s*$/.test(str)
check_path_username_agree = (path, username) ->
  
  # Because all user's home folder would be: username/
  # so, the path should starts from username, as: 'username/path/file/name...'
  return false  if path.indexOf(username) isnt 0
  true


path_chain = (path_string, prefix) ->
    return  if(typeof path_string isnt "string")
    prefix = prefix || '/ls/'

    parts = path_string.split("/")

    parts = parts.filter(
        (e) ->
            return e isnt ""
    )

    all_path = []
    tmp = ""
    i = 0
  
    while i < parts.length
        tmp = path.join(tmp, parts[i])
        all_path.push tmp
        i++

    href = []
    chain = "\n"
    one_path = ""
    j = 0
  
    while j < all_path.length
        one_path = path.join(prefix, all_path[j])
        chain = chain + "\n<a class=\"path_part\" href=\"" + one_path + "\"> " + parts[j] + " </a>/"
        j++
    
    #chain = '<a href="/treeview/">Home</a>/' + chain;
    return chain
  

make_cwd_chain = (path_string) ->
    return  if typeof path_string isnt "string"
    parts = path_string.split("/")

    # filter out empty string:
    parts = parts.filter((e) ->
      e isnt ""
    )
    all_path = []
    tmp = ""
    i = 0
  
    while i < parts.length
      tmp = path.join(tmp, parts[i])
      all_path.push tmp
      i++
    href = []
    chain = ""
    one_path = ""
    j = 0
  
    while j < all_path.length
      one_path = path.join("/treeview/", all_path[j])
      chain = chain + "<a href=\"" + one_path + "\"> " + parts[j] + " </a>/"
      j++
    chain = "<a href=\"/treeview/\">Home</a>/" + chain
    chain


# -- try styles, 
# Give a file list as <ul> element any way. 0209
# bootstrap css is just look awkward, file size >80k, it's style also poor.
list_style = (username, cwd, callback)->
    #

    folder_module.retrieve_folder(cwd).then( (folder) ->
        return callback("? no folder object for: " + cwd)  unless folder
        #folder.sort_files_by_date()
        folder.check_username  username, (err, role) ->
            p "check user name, role : ", role #do we need do this here?
            return callback([err, role], null) if err

            folder.give_ul_renderring  username, (ul) ->
                p 'give ul renderring: ', ul.slice(0, 100)

                people.make_people_manager_for_user(username).then((man)->
                    #p('man.Folder: ', man.Folder)
                    return man.get_a_few()
                ).then((current_people)->
                    if u.isArray(current_people)
                        current_people = htool.name_list_to_checkbox(current_people)
                    if not current_people
                        current_people = "<p>error or chose people from <a href=\"/people\"> people</a></p>"

                    cwd_chain = myutil.path_chain(cwd, "/ls/") # '/ls/' is start of the href

                    console.log( "parameters: username, cwd, cwd_chain, current_people \n",
                            username, cwd, cwd_chain, current_people)

                    css_file.read_css_file_of_folder(cwd).then (css_as_string) ->
                        #p 'In "ls for owner", css string:\n', css_as_string
                        assemble_html_2(username, ul, cwd, cwd_chain, current_people, css_as_string, (html) ->
                                callback null, html
                        )
                )

    )


# changing people/member, and direct-objs, circle 'list style' to let run.
user_module = require("../users/a.js")
list_tmp = (username, cwd, callback)->
    user_module.get_user_id(username, (err, id)->
        p 'get user id: ', id, username
    )

    #p 1, 'going to retrieve_folder: ', cwd
    folder_module.retrieve_folder(cwd).then( (folder) ->
        return callback("? no folder object for: " + cwd)  unless folder
        #folder.sort_files_by_date()

        # this will not check user name:
        ul = folder.get_ul_renderring()
        #p 2
        #folder.give_ul_renderring  username, (ul) --->>>
        #p 'give ul renderring: ', ul.slice(0, 100)

        current_people = "<p>not added in tmp solution 0417</p>"

        cwd_chain = myutil.path_chain(cwd, "/ls/") # '/ls/' is start of the href

        console.log( "parameters: username, cwd, cwd_chain, current_people \n",
                username, cwd, cwd_chain, current_people)

        css_file.read_css_file_of_folder(cwd).then (css_as_string) ->
            #p 3
            #p 'In "ls for owner", css string:\n', css_as_string
            assemble_html_2(username, ul, cwd, cwd_chain, current_people, css_as_string, (html) ->
                    callback null, html
            )
    )



# for the list-style above
assemble_html_2 = (username, ul_file_list, cwd, cwd_chain, current_people, in_file_css, callback) ->

  contexts =
    body:
      user_folder_ul: ul_file_list
      cwd: cwd
      cwd_chain: cwd_chain
      current_people: current_people

    header:
      username: username

    frame:
      in_file_css: in_file_css

  
  html_elements =
    body: "ls2.html"
    header: "ls2header.html"
    navbar: "ls2nav.html" # empty now.
    script: "file-list-script.html"
    frame: "frame-c.html"
  
  mytemplate.assemble_html_v2(html_elements, contexts).then (html) ->
      #p 'html in "assemble html 2":\n', html
      callback html




# -- a few fast checkings -- #

check_list_style = ()->
    name = 'abc'
    path_ = 'abc'
    list_style(name, path_, (err, html)->
        console.log  err, html.slice(0, 100)
    )


test_make_cwd_chain = ->
  a = make_cwd_chain("abc/goodagood/etc")
  console.log a
  console.log make_cwd_chain("goodagood/public/images")
  return

# test 
test_clone_default_folder_file = ->
  fake_user =
    username: "haha"
    id: "haha"

  cloned = clone_default_folder_file(fake_user)
  console.log cloned
  return



module.exports.list = exports.list = list

# export for testing:
module.exports.ls_for_owner = exports.ls_for_owner = ls_for_owner
module.exports.ls_for_username = exports.ls_for_username = ls_for_username
module.exports.path_to_chain = exports.path_to_chain = path_chain
module.exports.list_style = exports.list_style = list_style

# tmp solution:
module.exports.list_tmp  = exports.list_tmp  = list_tmp



if require.main is module
    #test_clone_default_folder_file();
    #test_check_out_cwd_tree();
    #test_make_cwd_chain()
    check_list_style()

    setTimeout(
        ()-> # close the process.
            process.exit 1000
            return
        , 3000
    )

