from pymongo import MongoClient

client = MongoClient(port=9017)
db = client.gg
collection = db.users

cursor = collection.find()

#Iterate the cursor and print the documents.

ids   = []
names = []

for document in cursor:
    ids.append(document["userid"])
    names.append(document["username"])
    print(document["username"], document["userid"])
    #print(document)


