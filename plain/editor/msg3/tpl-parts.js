
var multiline = require("multiline");


/*
 * Variables:
 *     acceptor_checkboxs,
 *     people_list, towhom
 */
module.exports.editor_form = multiline(function(){/*

    <div class="container">

      <form action="/msgto/{{{towhom}}}" method="post" enctype="multipare/x-www-form-urlencoded" id="edit">

        <fieldset data-role="controlgroup" data-type="horizontal" id="name-list" >

          <legend id="message-to-info">Message to: </legend>
          {{{ acceptor_checkboxs }}} 
          {{{ people_list }}}
        </fieldset>

        <fieldset id="enter-msg-f" >
            <legend>Edit message:</legend>
            <textarea name="tamsg2"  id="tamsg2" data-autogrow="true"></textarea>
        </fieldset>

        <input type="submit" value="Send" id="msgto_send" class="btn ui-btn">
      </form>

    </div> <!-- editor container -->

*/});



module.exports.message_accepters = multiline(function(){/*

      <fieldset data-role="controlgroup" data-type="horizontal" id="name-list" >
        <legend id="message-to-info">Message to: </legend>
        {{{ towhom_checkbox }}}
        {{{ people_list }}}
      </fieldset>

*/});


module.exports.message_list = multiline(function(){/*

      <div class="row-fluid message-list">
        {{{message_list}}}
      </div>

*/});


module.exports.message_accepters_with_abc = multiline(function(){/*

      <fieldset data-role="controlgroup" data-type="horizontal" id="name-list" >
        <legend id="message-to-info">Message to: </legend>
        <label title="currently user abc accept message every one" >
            <input type="checkbox" checked="checked" value="abc" data-userid="abc"
                title="currently user abc accept message every one" 
            />
            <span class="username" data-userid="abc" > abc </span>
        </label>
        {{{ towhom_checkbox }}}
        {{{ people_list }}}
      </fieldset>

*/});


module.exports.script_srcs = multiline(function(){/*

<script src="/static/bower_components/underscore/underscore-min.js"></script>
<script src="/static/js/msg3-js.js"></script>

*/});

if(require.main === module){
    console.log(editor_form);
}
