
/*
        #
        # Meta.name, Meta.path is required, offer them elsewhere.
        # All the defaults calculated here will NOT over-ride existed ones.
        # path would be full path: user-name/dirs/.../file-name.extension
        #
 *
 */
function calculate_meta_defaults(meta) {
    var Meta_s3key, necessaries;
    if (Meta == null) {
        p(' -- what the fuck Meta go? in file obj');
    }
    if (typeof Meta.filetype !== "string") {
        Meta.filetype = ft.check_file_type_by_name(Meta.name);
    }
    if (!Meta.uuid) {
        Meta.uuid = myutil.get_uuid();
    }
    if (typeof Meta.owner !== "string") {
        Meta.owner = guess_owner();
    }
    if (typeof Meta.dir !== "string") {
        Meta.dir = path.dirname(Meta.path);
    }
    if (typeof Meta.path_uuid !== "string") {
        Meta.path_uuid = path.join(Meta.dir, Meta.uuid);
    }
    Meta_s3key = path.join(myconfig.file_meta_prefix, Meta.owner, Meta.uuid);
    Meta.Meta_s3key = Meta_s3key;
    Meta.file_meta_s3key = Meta_s3key;
    if (typeof Meta.s3_stream_href !== "string") {
        Meta.s3_stream_href = calculate_s3_stream_href();
    }
    if (typeof Meta.delete_href !== "string") {
        Meta.delete_href = calculate_delete_href();
    }
    if (typeof Meta.view_href !== "string") {
        Meta.view_href = calculate_view_href();
    }
    necessaries = {
        what: myconfig.IamFile,
        timestamp: Date.now(),
        permission: {
            owner: "rwx",
            group: "",
            other: ""
        },
        "file-types": [],
        storage: {},
        storages: [],
        html: {},
        value: {
            amount: 0,
            unit: "GG"
        }
    };
    return u.defaults(Meta, necessaries);
};
