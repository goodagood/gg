
# currently changed to: file-collector-v2.coffee

collector   = require("./file-collector-v2.js")


p = console.log
stop = () ->
    setTimeout process.exit, 500


job = {
    "name": "new-file-meta",
    "task_name": "new-file-meta",
    "username": "abc",
    "folder": "abc/goodagood/message",
    "meta_s3key": ".gg.new/abc/goodagood/message/97ac58d9-e0e5-4e6b-8e58-27e05ed9ee31",
    "id": "task.a.4fd6b154-46da-4029-adc4-ba4ca2896b1e",
    "task_id": "task.a.4fd6b154-46da-4029-adc4-ba4ca2896b1e"
}

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

check_collector = ()->
    collector.collect_one_file(job, meta)



