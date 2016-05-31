from pymongo import MongoClient

#client = MongoClient(port=9017)
client = MongoClient(port=27017)
#client = MongoClient()
db = client.gg
collection = db.users


#Iterate the cursor and print the documents.

def find():
    cursor = collection.find()
    ids   = []
    names = []

    for document in cursor:
        one = ""
        if "userid" in document:
            ids.append(document["userid"])
            one += "id: {0},".format(document['userid'])
            #print("got id: {0}".format(document['userid']))
        if "username" in document:
            names.append(document["username"])
            #print("got username: {0}".format(document['username']))
            one += " -- username: {0}".format(document['username'])
        print(one)
        #print(document)

    both        = names + ids
    unique      = set(both)
    unique_list = list(unique)
    unique_list.sort()

    return unique_list

#find()
#print(find())


def find_ids():
    '''?'''
    cursor = collection.find()
    ids   = []

    for document in cursor:
        if "userid" in document:
            ids.append(document["userid"])
            print("got id: {0}".format(document['userid']))
        if "username" in document:
            names.append(document["username"])
            print("got username: {0}".format(document['username']))
        print(document)

    both        = names + ids
    unique      = set(both)
    unique_list = list(unique)
    unique_list.sort()

    return unique_list


def find_name(name):
    cursor = collection.find_one({username: name})
    if userid in cursor:
        uid = cursor['userid']
    else:
        uid = name


    return unique_list


def find_all_user_info():
    cursor = collection.find()
    docs = []

    for document in cursor:
        docs.append(document);

    return docs

def fit(ui):
    '''
    ui: user information
    '''
    simple = dict()
    if 'id' in ui: simple['id'] = ui['id']

    if 'id' not in simple:
        if 'userid' in ui: simple['id'] = ui['userid']

    if 'id' not in simple:
        if 'uid' in ui: simple['id'] = ui['uid']

    if 'id' in simple: simple['home'] = simple['id']
    if 'id' not in simple: simple['id'] = 'oh-i-have-no-user-id'


    if 'username' in ui: simple['owner'] = ui['username']

    if 'home' not in simple: simple['home'] = simple['owner']

    if 'owner' not in simple:
        raise NameError('Got no user name')


    return simple


def get_id_names():
    '''
    '''
    users = find_all_user_info()
    simple = map(fit, users)
    return simple


def all_names():
    ''' give a list of string, all user names
    '''
    infos = get_id_names()

    owners = [o['owner'] for o in infos]
    owners = sorted(owners)
    return owners


def get_all_names():
    ''' filter out names from doc, 'all_names' above will do it from
    'get_id_names', it's a little bit cost.
    '''
    users = find_all_user_info()
    return [user['username'] for user in users]



if __name__ == "__main__":
    #users = get_id_names();
    users = find_all_user_info()
    print(users)
