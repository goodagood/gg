#// todo 2016 0412

from pymongo import MongoClient


# The local port is actually been forward-ed to remote db server
client = MongoClient(port=27017)
gg_db  = client.gg

gg_user_collection     = gg_db.users
gg_loggings_collection = gg_db.loggings


