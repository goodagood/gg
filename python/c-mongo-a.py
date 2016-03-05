from pymongo import MongoClient

client = MongoClient()
db = client.test

cursor = db.restaurants.find()

#Iterate the cursor and print the documents.

for document in cursor:
    print(document)


