
/*
 * Render file info
 * 2016 0624
 */


const jade = require('jade');




function get_basic_template(){
    var Basic_template = 
    `div.file
        .name
            if thumbnail
                span.thumbnail
                    #{thumbnail}
            span.file_name #{name}

        .meta
            if type
                span.type #{type}
            if size
                span.size #{size}
            if timestamp
                span.time #{timestamp}
    `;

    var compiled = null;

    function get_template(){return Basic_template;}
    function set_template(template_str){
        Basic_template = template_str;
        compile();
    }


    function compile(options){
        options  = options || {pretty: true};
        compiled = jade.compile(Basic_template, options);
    }

    function render(dict){
        dict = dict || {};
        if(!dict.name) return '';  // no name no renderring
        if(compiled === null) compile();
        return compiled(dict);
    }

    return {
        get_template: get_template,
        set_template: set_template,
        compile: compile,
        render: render
    };
}

if(typeof window === 'undefined') console.log('no window object');
else window.get_basic_template = get_basic_template;


var test_temp = 
`
h1
    The first header

p
    The paragraph
`;



if(require.main === module){
    var p = console.log;

    /// sample data, from tmp/public
    var sample_file_list = [
            {
                "size": 55,
                "li": "\n    <li class=\"file-li text/plain\">\n        <span class=\"name\">a.txt</span>\n        <span class=\"size\"></span>\n        <span class=\"type\">text/plain</span>\n    </li>\n    ",
                "timestamp": 1460117699767.2688,
                "name": "a.txt",
                "type": "text/plain"
            },
            {
                "name": "t.png"
            },
            {
                "size": 32663915,
                "posters": {
                    "0.0": {
                        "key": ".gg.file.name.space/tmp/7857cd02-b922-48aa-8e7f-564d9a04735e/posters/0.0.png",
                        "seconds": 0.0,
                        "thumbnails": {
                            "h80": ".gg.file.name.space/tmp/7857cd02-b922-48aa-8e7f-564d9a04735e/posters/thumb-0.0h80.png",
                            "h160": ".gg.file.name.space/tmp/7857cd02-b922-48aa-8e7f-564d9a04735e/posters/thumb-0.0h160.png"
                        }
                    }
                },
                "poster": ".gg.file.name.space/tmp/7857cd02-b922-48aa-8e7f-564d9a04735e/posters/0.0.png",
                "thumb": ".gg.file.name.space/tmp/7857cd02-b922-48aa-8e7f-564d9a04735e/posters/thumb-0.0h160.png",
                "name": "dog2014.mp4",
                "type": "video/mp4"
            },
            {
                "size": 37026041,
                "posters": {
                    "0.0": {
                        "key": ".gg.file.name.space/tmp/105a16d2-7c0a-4d2a-ba0d-e4c005a1beea/posters/0.0.png",
                        "seconds": 0.0,
                        "thumbnails": {
                            "h80": ".gg.file.name.space/tmp/105a16d2-7c0a-4d2a-ba0d-e4c005a1beea/posters/thumb-0.0h80.png",
                            "h160": ".gg.file.name.space/tmp/105a16d2-7c0a-4d2a-ba0d-e4c005a1beea/posters/thumb-0.0h160.png"
                        }
                    }
                },
                "poster": ".gg.file.name.space/tmp/105a16d2-7c0a-4d2a-ba0d-e4c005a1beea/posters/0.0.png",
                "thumb": ".gg.file.name.space/tmp/105a16d2-7c0a-4d2a-ba0d-e4c005a1beea/posters/thumb-0.0h160.png",
                "name": "cat-dog.mp4",
                "type": "video/mp4"
            },
            {
                "li": "\n    <li class=\"\">\n        <span class=\"name\">t1.png</span>\n        <span class=\"size\"></span>\n        <span class=\"type\"></span>\n    </li>\n    ",
                "timestamp": 1460951482906,
                "name": "t1.png"
            },
            {
                "size": 7047002,
                "posters": {
                    "0.0": {
                        "key": ".gg.file.name.space/tmp/17128bc3-30ac-40f3-88a1-a0d50575d732/posters/0.0.png",
                        "seconds": 0.0,
                        "thumbnails": {
                            "h80": ".gg.file.name.space/tmp/17128bc3-30ac-40f3-88a1-a0d50575d732/posters/thumb-0.0h80.png",
                            "h160": ".gg.file.name.space/tmp/17128bc3-30ac-40f3-88a1-a0d50575d732/posters/thumb-0.0h160.png"
                        }
                    }
                },
                "poster": ".gg.file.name.space/tmp/17128bc3-30ac-40f3-88a1-a0d50575d732/posters/0.0.png",
                "thumb": ".gg.file.name.space/tmp/17128bc3-30ac-40f3-88a1-a0d50575d732/posters/thumb-0.0h160.png",
                "name": "cats2014.mp4",
                "type": "video/mp4"
            },
            {
                "size": 3260,
                "name": "h5.html",
                "type": "text/html"
            },
            {
                "size": 48046,
                "name": "man.ssh.txt",
                "type": "text/plain"
            },
            {
                "size": 1689,
                "name": "a.py",
                "type": "('text/x-python',none)"
            },
            {
                "size": 3956367,
                "posters": {
                    "0.0": {
                        "key": ".gg.file.name.space/tmp/ecacf81a-c174-428f-9d6d-dd0dbc2f076f/posters/0.0.png",
                        "seconds": 0.0,
                        "thumbnails": {
                            "h80": ".gg.file.name.space/tmp/ecacf81a-c174-428f-9d6d-dd0dbc2f076f/posters/thumb-0.0h80.png",
                            "h160": ".gg.file.name.space/tmp/ecacf81a-c174-428f-9d6d-dd0dbc2f076f/posters/thumb-0.0h160.png"
                        }
                    }
                },
                "poster": ".gg.file.name.space/tmp/ecacf81a-c174-428f-9d6d-dd0dbc2f076f/posters/0.0.png",
                "thumb": ".gg.file.name.space/tmp/ecacf81a-c174-428f-9d6d-dd0dbc2f076f/posters/thumb-0.0h160.png",
                "name": "tt1.mp4",
                "type": "video/mp4"
            },
            {
                "size": 704395,
                "posters": {
                    "0.0": {
                        "key": ".gg.file.name.space/tmp/2862321d-e2ba-4f17-b47f-4b11a5c0dd7a/posters/0.0.png",
                        "seconds": 0.0,
                        "thumbnails": {
                            "h80": ".gg.file.name.space/tmp/2862321d-e2ba-4f17-b47f-4b11a5c0dd7a/posters/thumb-0.0h80.png",
                            "h160": ".gg.file.name.space/tmp/2862321d-e2ba-4f17-b47f-4b11a5c0dd7a/posters/thumb-0.0h160.png"
                        }
                    }
                },
                "poster": ".gg.file.name.space/tmp/2862321d-e2ba-4f17-b47f-4b11a5c0dd7a/posters/0.0.png",
                "thumb": ".gg.file.name.space/tmp/2862321d-e2ba-4f17-b47f-4b11a5c0dd7a/posters/thumb-0.0h160.png",
                "name": "tt1.webm",
                "type": "video/webm"
            },
            {
                "size": 38516,
                "name": "man.git.txt",
                "type": "text/plain"
            },
            {
                "size": 64086858,
                "posters": {
                    "0.0": {
                        "key": ".gg.file.name.space/tmp/45912442-1b18-4215-a85a-5975bb609428/posters/0.0.png",
                        "seconds": 0.0,
                        "thumbnails": {
                            "h80": ".gg.file.name.space/tmp/45912442-1b18-4215-a85a-5975bb609428/posters/thumb-0.0h80.png",
                            "h160": ".gg.file.name.space/tmp/45912442-1b18-4215-a85a-5975bb609428/posters/thumb-0.0h160.png"
                        }
                    }
                },
                "poster": ".gg.file.name.space/tmp/45912442-1b18-4215-a85a-5975bb609428/posters/0.0.png",
                "thumb": ".gg.file.name.space/tmp/45912442-1b18-4215-a85a-5975bb609428/posters/thumb-0.0h160.png",
                "name": "cat-food.mp4",
                "type": "video/mp4"
            },
            {
                "size": 230,
                "name": "a.json",
                "type": "application/octet-stream"
            },
            {
                "size": 1151,
                "name": "index.html",
                "type": "text/html"
            }
    ];
    // end of sample data
    //

    //p(jade.compile(test_temp, {})({}) );

    var d0 = sample_file_list[0];
    var Html = get_basic_template().render(d0);
    p(Html);


}



