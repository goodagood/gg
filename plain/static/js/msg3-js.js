/*
 * redo 2016 , 0127
 */

$( document ).ready(function() {

    // set by server
    var towhom = '{{{towhom}}}';

    var receivers = [];
    if (towhom && towhom !== '' && towhom !== '{{{towhom}}}') receivers.push(towhom);

    $("input:checkbox").prop('checked', false);

    // 0303
    $("#tamsg2").textinput();

    function get_checked_name(){
        var names = [];
        $("input:checkbox:checked").each(function(i){
            var value = $(this).val();
            names.push(value);
        });
        return names;
    }

    $("input:checkbox").change(function(e){
        var names = get_checked_name();
        //console.log(names);
    });

    //$("form#msg")....
    $("form#edit").submit(function(e){
        e.preventDefault();
        var names = get_checked_name();
        var no_empty = names.filter(function(i){return !!i;});
        if(_.isEmpty(no_empty)) return false;  // no receiver?

        var name_list_stringified = JSON.stringify(no_empty);

        // change after dev testing 0708
        //var url = 'http://54.178.88.149:9090/sendmsg/';
        var url = '/msgto/';
        var text = $('textarea').val();
        var param = {url:url, type:'POST', data:{to:name_list_stringified, text_input:text, }, dataType:'json'};
        alert(text);
        console.log('to submit');
        console.log(param);
        //$.inspect(param);
        $.ajax(param)
        .done(function(data){
            $("form textarea#tamsg2").val('').focus();
            console.log(data);
            //alert(data);
            //window.location.replace("/msgto/");
            //location.reload(true);
        })
        .fail(function(data){
            alert('failed?');
            console.log('failed?');
            console.log(data);
            //$.inspect(data);
        });
    });

    //$("button#msgto_send").click(function(event){
    //  event.preventDefault();
    //  var no_empty = receivers.filter(function(e){return !!e;});
    //  var name_list_stringified = JSON.stringify(no_empty);
    //  //no_empty.forEach(function(name){
    //    var url = 'http://54.178.88.149:9090/msgto/';
    //    var text = $('textarea').val();
    //    var param = {url:url, type:'POST', data:{to:name_list_stringified, text_input:text, }, dataType:'json'};
    //    //alert(text);
    //    //alert(param);
    //    //$.inspect(param);
    //    $.ajax(param)
    //    .done(function(data){
    //      //alert(data);
    //      window.location.replace("/msgto/");
    //      //location.reload(true);
    //    })
    //    .fail(function(data){
    //      alert('failed?');// alert(data);
    //      $.inspect(data);
    //    });
    //  //});
    //});

    //$.inspect(this);

    //console.log( 'ready, + underscore: ', _ );
    console.log( 'here, 737pm');

});
