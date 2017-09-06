// 01 31, 2015
// some upload data missed out, any way.
//
var form1 = { name: 'new-file-meta',
    username: 'abc',
    folder: 'abc/test',
    new_meta_s3key: '.gg.new/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e',
    id: 'task.a.e4d2cf75-4062-44a7-9c8f-3ab17e37bece',
    task_id: 'task.a.e4d2cf75-4062-44a7-9c8f-3ab17e37bece' };


var form1m = { name: 'formidable.md',
    size: 13497,
    lastModifiedDate: '2015-01-31T12:06:03.652Z',
    type: 'text/x-markdown',
    path: 'abc/test/formidable.md',
    dir: 'abc/test',
    owner: 'abc',
    timestamp: 1422705963652,
    uuid: '96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e',
    new_meta_s3key: '.gg.new/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e',
    storage:
    { type: 's3',
        key: '.gg.file/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e' } };

module.exports.fj  = form1;
module.exports.fjm = form1m;

var form1mm = { name: 'formidable.md',
    size: 13497,
    lastModifiedDate: '2015-01-31T12:06:03.652Z',
    type: 'text/x-markdown',
    path: 'abc/test/formidable.md',
    dir: 'abc/test',
    owner: 'abc',
    timestamp: 1422705963652,
    uuid: '96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e',
    new_meta_s3key: '.gg.new/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e',
    storage:
    { type: 's3',
        key: '.gg.file/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e' },
    filetype: 'markdown',
    path_uuid: 'abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e',
    Meta_s3key: '.gg.file.meta/abc/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e',
    file_meta_s3key: '.gg.file.meta/abc/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e',
    s3_stream_href: '/ss/.gg.file/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e',
    delete_href: '/del/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e',
    view_href: '/viewtxt/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e',
    what: 'I-am-goodagood-file.2014-0625.',
    permission: { owner: 'rwx', group: '', other: '' },
    'file-types': [],
    storages: [],
    html:
    { elements:
        { 'file-selector': '<label class="file-selector">\n<input type="checkbox" name="filepath[]" value="abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e" />\n\n<span class="filename">formidable.md</span>\n</label>',
            anchor: '<a href="/ss/.gg.file/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e"> formidable.md</a>',
            'text-view': '<a href="/viewtxt/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e">\n<span class="glyphicon glyphicon-zoom-in"> </span>Read\n</a>',
            remove: ' <a href="/del/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e"> <span class="glyphicon glyphicon-remove"></span>Delete</a>',
            'path-uuid': '<a href="/fileinfo-pathuuid/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e"> <i class="fa fa-paw"> </i> Paw-in </a>',
            'name-info': '<a href="/file-info/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e" >formidable.md</a>',
            viewer: '<a class="viewer" href="/viewmd/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e">Viewer</a>',
            editor: '<a class="editor" href="/edit-md/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e">Editor</a>' },
        li: '<li class="file"><label class="file-selector">\n<input type="checkbox" name="filepath[]" value="abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e" />\n\n<span class="filename">formidable.md</span>\n</label>&nbsp;\n<a href="/ss/.gg.file/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e"> formidable.md</a>&nbsp;\n<span class="glyphicon glyphicon-star"></span>&nbsp;\n<ul class="list-unstyled file-info"><li>\n<a class="viewer" href="/viewmd/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e">Viewer</a>&nbsp;\n<a class="editor" href="/edit-md/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e">Editor</a>&nbsp;\n<a href="/fileinfo-pathuuid/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e"> <i class="fa fa-paw"> </i> Paw-in </a>&nbsp;\n <a href="/del/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e"> <span class="glyphicon glyphicon-remove"></span>Delete</a>&nbsp;\n<a href="/ss/.gg.file/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e" >formidable.md</a>\n<a href="/view/abc/test/formidable.md" >&nbsp; view</a>\n <a href="/del/abc/test/96ff2ed6-7b6e-4f07-ba94-ac6479bfd53e"> <span class="glyphicon glyphicon-remove"> </span></a>\n</li></ul></li>' },
    value: { amount: 0, unit: 'GG' } };



// --


var portj = { name: 'new-file-meta',
    username: 'tmpab',
    folder: 'tmpab',
    new_meta_s3key: '.gg.new/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf',
    id: 'task.a.4dc78320-d0bc-42ef-9e53-64dce8a02ced',
    task_id: 'task.a.4dc78320-d0bc-42ef-9e53-64dce8a02ced' };


var portm =              { name: 'ports.md',
    size: 4122,
    lastModifiedDate: '2015-01-31T12:08:08.689Z',
    type: 'text/x-markdown',
    path: 'tmpab/ports.md',
    dir: 'tmpab',
    owner: 'tmpab',
    timestamp: 1422706088689,
    uuid: '5fde35aa-a7bc-43d1-a3a1-e09868b216bf',
    new_meta_s3key: '.gg.new/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf',
    storage:
    { type: 's3',
        key: '.gg.file/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf' } };

module.exports.pj  = portj;
module.exports.pjm = portm;

var partmm = { name: 'ports.md',
    size: 4122,
    lastModifiedDate: '2015-01-31T12:08:08.689Z',
    type: 'text/x-markdown',
    path: 'tmpab/ports.md',
    dir: 'tmpab',
    owner: 'tmpab',
    timestamp: 1422706088689,
    uuid: '5fde35aa-a7bc-43d1-a3a1-e09868b216bf',
    new_meta_s3key: '.gg.new/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf',
    storage:
    { type: 's3',
        key: '.gg.file/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf' },
    filetype: 'markdown',
    path_uuid: 'tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf',
    Meta_s3key: '.gg.file.meta/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf',
    file_meta_s3key: '.gg.file.meta/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf',
    s3_stream_href: '/ss/.gg.file/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf',
    delete_href: '/del/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf',
    view_href: '/viewtxt/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf',
    what: 'I-am-goodagood-file.2014-0625.',
    permission: { owner: 'rwx', group: '', other: '' },
    'file-types': [],
    storages: [],
    html:
    { elements:
        { 'file-selector': '<label class="file-selector">\n<input type="checkbox" name="filepath[]" value="tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf" />\n\n<span class="filename">ports.md</span>\n</label>',
            anchor: '<a href="/ss/.gg.file/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf"> ports.md</a>',
            'text-view': '<a href="/viewtxt/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf">\n<span class="glyphicon glyphicon-zoom-in"> </span>Read\n</a>',
            remove: ' <a href="/del/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf"> <span class="glyphicon glyphicon-remove"></span>Delete</a>',
            'path-uuid': '<a href="/fileinfo-pathuuid/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf"> <i class="fa fa-paw"> </i> Paw-in </a>',
            'name-info': '<a href="/file-info/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf" >ports.md</a>',
            viewer: '<a class="viewer" href="/viewmd/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf">Viewer</a>',
            editor: '<a class="editor" href="/edit-md/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf">Editor</a>' },
        li: '<li class="file"><label class="file-selector">\n<input type="checkbox" name="filepath[]" value="tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf" />\n\n<span class="filename">ports.md</span>\n</label>&nbsp;\n<a href="/ss/.gg.file/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf"> ports.md</a>&nbsp;\n<span class="glyphicon glyphicon-star"></span>&nbsp;\n<ul class="list-unstyled file-info"><li>\n<a class="viewer" href="/viewmd/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf">Viewer</a>&nbsp;\n<a class="editor" href="/edit-md/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf">Editor</a>&nbsp;\n<a href="/fileinfo-pathuuid/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf"> <i class="fa fa-paw"> </i> Paw-in </a>&nbsp;\n <a href="/del/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf"> <span class="glyphicon glyphicon-remove"></span>Delete</a>&nbsp;\n<a href="/ss/.gg.file/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf" >ports.md</a>\n<a href="/view/tmpab/ports.md" >&nbsp; view</a>\n <a href="/del/tmpab/5fde35aa-a7bc-43d1-a3a1-e09868b216bf"> <span class="glyphicon glyphicon-remove"> </span></a>\n</li></ul></li>' },
    value: { amount: 0, unit: 'GG' } };



// --


var mdj = { name: 'new-file-meta',
    username: 'tmpab',
    folder: 'tmpab',
    new_meta_s3key: '.gg.new/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a',
    id: 'task.a.1e36d5f1-73c1-426e-8dcd-12a14d7c4f12',
    task_id: 'task.a.1e36d5f1-73c1-426e-8dcd-12a14d7c4f12' };


var mdm =              { name: 'marked.md',
    size: 9772,
    lastModifiedDate: '2015-01-31T12:10:21.382Z',
    type: 'text/x-markdown',
    path: 'tmpab/marked.md',
    dir: 'tmpab',
    owner: 'tmpab',
    timestamp: 1422706221383,
    uuid: '39df2c47-d980-48ca-a3e9-36d4476a1c2a',
    new_meta_s3key: '.gg.new/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a',
    storage:
    { type: 's3',
        key: '.gg.file/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a' } };

module.exports.mj  = mdj;
module.exports.mjm = mdm;

//file meta in collect one file, 1
var mdmm = { name: 'marked.md',
    size: 9772,
    lastModifiedDate: '2015-01-31T12:10:21.382Z',
    type: 'text/x-markdown',
    path: 'tmpab/marked.md',
    dir: 'tmpab',
    owner: 'tmpab',
    timestamp: 1422706221383,
    uuid: '39df2c47-d980-48ca-a3e9-36d4476a1c2a',
    new_meta_s3key: '.gg.new/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a',
    storage:
    { type: 's3',
        key: '.gg.file/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a' },
    filetype: 'markdown',
    path_uuid: 'tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a',
    Meta_s3key: '.gg.file.meta/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a',
    file_meta_s3key: '.gg.file.meta/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a',
    s3_stream_href: '/ss/.gg.file/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a',
    delete_href: '/del/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a',
    view_href: '/viewtxt/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a',
    what: 'I-am-goodagood-file.2014-0625.',
    permission: { owner: 'rwx', group: '', other: '' },
    'file-types': [],
    storages: [],
    html:
    { elements:
        { 'file-selector': '<label class="file-selector">\n<input type="checkbox" name="filepath[]" value="tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a" />\n\n<span class="filename">marked.md</span>\n</label>',
            anchor: '<a href="/ss/.gg.file/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a"> marked.md</a>',
            'text-view': '<a href="/viewtxt/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a">\n<span class="glyphicon glyphicon-zoom-in"> </span>Read\n</a>',
            remove: ' <a href="/del/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a"> <span class="glyphicon glyphicon-remove"></span>Delete</a>',
            'path-uuid': '<a href="/fileinfo-pathuuid/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a"> <i class="fa fa-paw"> </i> Paw-in </a>',
            'name-info': '<a href="/file-info/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a" >marked.md</a>',
            viewer: '<a class="viewer" href="/viewmd/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a">Viewer</a>',
            editor: '<a class="editor" href="/edit-md/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a">Editor</a>' },
        li: '<li class="file"><label class="file-selector">\n<input type="checkbox" name="filepath[]" value="tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a" />\n\n<span class="filename">marked.md</span>\n</label>&nbsp;\n<a href="/ss/.gg.file/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a"> marked.md</a>&nbsp;\n<span class="glyphicon glyphicon-star"></span>&nbsp;\n<ul class="list-unstyled file-info"><li>\n<a class="viewer" href="/viewmd/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a">Viewer</a>&nbsp;\n<a class="editor" href="/edit-md/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a">Editor</a>&nbsp;\n<a href="/fileinfo-pathuuid/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a"> <i class="fa fa-paw"> </i> Paw-in </a>&nbsp;\n <a href="/del/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a"> <span class="glyphicon glyphicon-remove"></span>Delete</a>&nbsp;\n<a href="/ss/.gg.file/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a" >marked.md</a>\n<a href="/view/tmpab/marked.md" >&nbsp; view</a>\n <a href="/del/tmpab/39df2c47-d980-48ca-a3e9-36d4476a1c2a"> <span class="glyphicon glyphicon-remove"> </span></a>\n</li></ul></li>' },
    value: { amount: 0, unit: 'GG' } };




// --


var jqmj =  { name: 'new-file-meta',
    username: 'tmpab',
    folder: 'tmpab',
    new_meta_s3key: '.gg.new/tmpab/fae51900-4267-49c2-b51d-03adceb5a444',
    id: 'task.a.fdf0d19d-7f3c-4bdf-bf10-55b188e7bd76',
    task_id: 'task.a.fdf0d19d-7f3c-4bdf-bf10-55b188e7bd76' };


var jqmm =  { name: 'jq-m.html',
    size: 81087,
    lastModifiedDate: '2015-01-31T12:12:46.196Z',
    type: 'text/html',
    path: 'tmpab/jq-m.html',
    dir: 'tmpab',
    owner: 'tmpab',
    timestamp: 1422706366196,
    uuid: 'fae51900-4267-49c2-b51d-03adceb5a444',
    new_meta_s3key: '.gg.new/tmpab/fae51900-4267-49c2-b51d-03adceb5a444',
    storage:
    { type: 's3',
        key: '.gg.file/tmpab/fae51900-4267-49c2-b51d-03adceb5a444' } };

module.exports.jj  = jqmj;
module.exports.jjm = jqmm;

//file meta in collect one file, 1
var jqmmm = { name: 'jq-m.html',
    size: 81087,
    lastModifiedDate: '2015-01-31T12:12:46.196Z',
    type: 'text/html',
    path: 'tmpab/jq-m.html',
    dir: 'tmpab',
    owner: 'tmpab',
    timestamp: 1422706366196,
    uuid: 'fae51900-4267-49c2-b51d-03adceb5a444',
    new_meta_s3key: '.gg.new/tmpab/fae51900-4267-49c2-b51d-03adceb5a444',
    storage:
    { type: 's3',
        key: '.gg.file/tmpab/fae51900-4267-49c2-b51d-03adceb5a444' },
    filetype: 'web',
    path_uuid: 'tmpab/fae51900-4267-49c2-b51d-03adceb5a444',
    Meta_s3key: '.gg.file.meta/tmpab/fae51900-4267-49c2-b51d-03adceb5a444',
    file_meta_s3key: '.gg.file.meta/tmpab/fae51900-4267-49c2-b51d-03adceb5a444',
    s3_stream_href: '/ss/.gg.file/tmpab/fae51900-4267-49c2-b51d-03adceb5a444',
    delete_href: '/del/tmpab/fae51900-4267-49c2-b51d-03adceb5a444',
    view_href: '/viewtxt/tmpab/fae51900-4267-49c2-b51d-03adceb5a444',
    what: 'I-am-goodagood-file.2014-0625.',
    permission: { owner: 'rwx', group: '', other: '' },
    'file-types': [],
    storages: [],
    html:
    { elements:
        { 'file-selector': '<label class="file-selector">\n<input type="checkbox" name="filepath[]" value="tmpab/fae51900-4267-49c2-b51d-03adceb5a444" />\n\n<span class="filename">jq-m.html</span>\n</label>',
            anchor: '<a href="/ss/.gg.file/tmpab/fae51900-4267-49c2-b51d-03adceb5a444"> jq-m.html</a>',
            'text-view': '<a href="/viewtxt/tmpab/fae51900-4267-49c2-b51d-03adceb5a444">\n<span class="glyphicon glyphicon-zoom-in"> </span>Read\n</a>',
            remove: ' <a href="/del/tmpab/fae51900-4267-49c2-b51d-03adceb5a444"> <span class="glyphicon glyphicon-remove"></span>Delete</a>',
            'path-uuid': '<a href="/fileinfo-pathuuid/tmpab/fae51900-4267-49c2-b51d-03adceb5a444"> <i class="fa fa-paw"> </i> Paw-in </a>',
            'name-info': '<a href="/file-info/tmpab/fae51900-4267-49c2-b51d-03adceb5a444" >jq-m.html</a>' },
        li: '<li class="file"><label class="file-selector">\n<input type="checkbox" name="filepath[]" value="tmpab/fae51900-4267-49c2-b51d-03adceb5a444" />\n\n<span class="filename">jq-m.html</span>\n</label>&nbsp;\n<ul class="list-unstyled file-info"><li>\n<a href="/viewtxt/tmpab/fae51900-4267-49c2-b51d-03adceb5a444">\n<span class="glyphicon glyphicon-zoom-in"> </span>Read\n</a>&nbsp;\n <a href="/del/tmpab/fae51900-4267-49c2-b51d-03adceb5a444"> <span class="glyphicon glyphicon-remove"></span>Delete</a>&nbsp;\n<a href="/fileinfo-pathuuid/tmpab/fae51900-4267-49c2-b51d-03adceb5a444"> <i class="fa fa-paw"> </i> Paw-in </a>&nbsp;\n</li></ul></li>\n',
        li_viewer: '<li class="file"><label class="file-selector">\n<input type="checkbox" name="filepath[]" value="tmpab/fae51900-4267-49c2-b51d-03adceb5a444" />\n\n<span class="filename">jq-m.html</span>\n</label>&nbsp;\n<a href="/ss/.gg.file/tmpab/fae51900-4267-49c2-b51d-03adceb5a444"> jq-m.html</a>&nbsp;\n<ul class="list-unstyled file-info"><li>\n<a href="/viewtxt/tmpab/fae51900-4267-49c2-b51d-03adceb5a444">\n<span class="glyphicon glyphicon-zoom-in"> </span>Read\n</a>&nbsp;\n</li></ul></li>' },
    value: { amount: 0, unit: 'GG' } };


// ---

var job = {
    "name": "new-file-meta",
    "task_name": "new-file-meta",
    "username": "abc",
    "folder": "abc/goodagood/message",
    "meta_s3key": ".gg.new/abc/goodagood/message/97ac58d9-e0e5-4e6b-8e58-27e05ed9ee31",
    "id": "task.a.4fd6b154-46da-4029-adc4-ba4ca2896b1e",
    "task_id": "task.a.4fd6b154-46da-4029-adc4-ba4ca2896b1e"
};

var meta = {
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
};


job2 = {
    "name": "new-file-meta",
    "task_name": "new-file-meta",
    "username": "abc",
    "folder": "abc/goodagood",
    "meta_s3key": ".gg.new/abc/goodagood/a5437410-2d5a-4bb7-b860-ecfe5fe8b400",
    "id": "task.a.efbd43a5-7381-40d6-88ed-ed0b6ddab2df",
    "task_id": "task.a.efbd43a5-7381-40d6-88ed-ed0b6ddab2df"
}

meta2 = {
    "name": ".gg.people.v1.json",
    "path": "abc/goodagood/.gg.people.v1.json",
    "size": 112,
    "owner": "abc",
    "dir": "abc/goodagood",
    "timestamp": 1418877986342,
    "uuid": "a5437410-2d5a-4bb7-b860-ecfe5fe8b400",
    "meta_s3key": ".gg.new/abc/goodagood/a5437410-2d5a-4bb7-b860-ecfe5fe8b400",
    "initial_key": ".gg.new/abc/goodagood/a5437410-2d5a-4bb7-b860-ecfe5fe8b400",
    "s3key": ".gg.file/abc/goodagood/a5437410-2d5a-4bb7-b860-ecfe5fe8b400",
    "storage": {
        "type": "s3",
        "key": ".gg.file/abc/goodagood/a5437410-2d5a-4bb7-b860-ecfe5fe8b400"
    }
};

job3 = {
    "name": "new-file-meta",
    "username": "abc",
    "folder": "abc/test",
    "meta_s3key": ".gg.new/abc/test/activities.txt",
    "id": "task.a.3660e49c-df21-4f05-8a5a-e7f1c910265b",
    "task_id": "task.a.3660e49c-df21-4f05-8a5a-e7f1c910265b"
};

meta3 = {
    "name": "activities.txt",
    "size": 1165,
    "lastModifiedDate": "2014-12-19T11:22:38.518Z",
    "type": "text/plain",
    "path": "abc/test/activities.txt",
    "timestamp": 1418988158519,
    "uuid": "f1b3a425-1cfb-4b89-99f0-2b8abd9b6ad5",
    "s3key": ".gg.file/abc/test/activities.txt",
    "meta_s3key": ".gg.new/abc/test/activities.txt",
    "storage": {
        "type": "s3",
        "key": ".gg.file/abc/test/activities.txt"
    },
    "owner": "abc"
}; 

job4 = {
    "name": "new-file-meta",
    "username": "abc",
    "folder": "abc/tadd",
    "meta_s3key": ".gg.new/abc/tadd/20.jpg",
    "id": "task.a.d9a4007a-0a20-4d0b-b2b2-a54858d2abb1",
    "task_id": "task.a.d9a4007a-0a20-4d0b-b2b2-a54858d2abb1"
};

meta4 = {
    "name": "20.jpg",
    "size": 183111,
    "lastModifiedDate": "2014-12-20T08:26:42.439Z",
    "type": "image/jpeg",
    "path": "abc/tadd/20.jpg",
    "timestamp": 1419064002440,
    "uuid": "c9f1bd28-ab3e-4307-845c-df362b7940e1",
    "s3key": ".gg.file/abc/tadd/20.jpg",
    "meta_s3key": ".gg.new/abc/tadd/20.jpg",
    "storage": {
        "type": "s3",
        "key": ".gg.file/abc/tadd/20.jpg"
    },
    "owner": "abc"
};



mqmd = { name: 'media-query.md',
  size: 7001,
  lastModifiedDate: '2015-01-30T02:58:53.554Z',
  type: 'text/x-markdown',
  path: 'tmpab/media-query.md',
  dir: 'tmpab',
  owner: 'tmpab',
  timestamp: 1422586733554,
  uuid: 'c4041648-888f-4feb-b92a-90e24e0b3089',
  new_meta_s3key: '.gg.new/tmpab/c4041648-888f-4feb-b92a-90e24e0b3089',
  storage: 
   { type: 's3',
     key: '.gg.file/tmpab/c4041648-888f-4feb-b92a-90e24e0b3089' } };


var job31 = { 
    name: 'new-file-meta',
    username: 'tmpab',
    folder: 'tmpab',
    new_meta_s3key: '.gg.new/tmpab/dc45ebe5-d213-4914-a267-3e14734ccebc',
    id: 'task.a.c99d1d32-5d3f-4d28-916b-35acff1e219c',
    task_id: 'task.a.c99d1d32-5d3f-4d28-916b-35acff1e219c'
};


var meta31 = { 
    name: 'jq-m.md',
    size: 81091,
    lastModifiedDate: '2015-01-31T10:10:10.937Z',
    type: 'text/x-markdown',
    path: 'tmpab/jq-m.md',
    dir: 'tmpab',
    owner: 'tmpab',
    timestamp: 1422699010937,
    uuid: 'dc45ebe5-d213-4914-a267-3e14734ccebc',
    new_meta_s3key: '.gg.new/tmpab/dc45ebe5-d213-4914-a267-3e14734ccebc',
    storage:
    { 
        type: 's3',
        key: '.gg.file/tmpab/dc45ebe5-d213-4914-a267-3e14734ccebc' 
    } 
};



