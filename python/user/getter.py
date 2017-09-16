#// todo 2016 0412

#import path_setting
import dbs.mongo

#client = MongoClient(port=27017)
#db = client.gg
#collection = db.users


def list_users():
    cursor = dbs.mongo.gg_user_collection.find()
    users  = []

    for doc in cursor:
        users.append(doc)
        #print(doc)

    return users


def list_all_names():
    ''' filter out names from doc, 'all_names' above will do it from
    'get_id_names', it's a little bit cost.
    '''
    users = list_users()
    names = [user['username'] for user in users]
    return sorted(names)

if __name__ == "__main__":
    ''
    #list_users()
    print(list_all_names())
