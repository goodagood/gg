#// todo 2016 0412
from pymongo import MongoClient

client = MongoClient(port=27017)
gg_db  = client.gg

gg_user_collection = gg_db.users



