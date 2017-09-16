
import json
import sqlite3 as lite

from pprint import pprint



def get_conf():
    with open('/home/ubuntu/workspace/gg/config/config.json') as f:
        conf = json.load(f)
        pass
    return conf


conf = get_conf()
conn = lite.connect(conf['lite3db1'])
c = conn.cursor()


def init_db():
    #conf = get_conf()
    #conn = lite.connect(conf['lite3db1'])
    #c = conn.cursor()

    c.execute("DROP TABLE IF EXISTS gg")

    c.execute('''CREATE TABLE gg (
             id       INTEGER PRIMARY KEY,
             json     TEXT,
             username TEXT,
             locpath  TEXT,
             cwd      TEXT,
             filename TEXT,
             milli    INTEGER,
             size     INTEGER,
             type     TEXT,
             descr    TEXT
             )''')
    conn.commit()
    #conn.close()
    pass


def insert(ahash):
    '''
    Parameter: ahash
        {
            name: value
            ...
        }
        Where name is in:
          json username locpath cwd filename milli size type descr
          'id' should be not needed
    '''
    names = [ 'json', 'username', 'locpath', 'cwd', 'filename', 'milli',
            'size', 'type', 'descr' ]

    keys = ahash.keys()
    questions = ['?' for k in keys]

    column_list   = ", ".join(keys)
    question_list = ", ".join(questions)
    value_list    = [ahash[k] for k in keys]
    value_tuple   = tuple(value_list)

    cmd = """INSERT INTO gg ( %(column_list)s )
        VALUES ( %(question_list)s)
        """ % {"column_list": column_list, "question_list": question_list}
    print cmd
    print value_tuple

    c.execute(cmd, value_tuple)
    conn.commit()



if __name__ == "__main__":
    #conf = get_conf()
    #pprint(get_conf())
    #pprint(conf['lite3db1'])

    #init_db()
    insert({
        "filename": 'file-name.jpg',
        "cwd": "cwd/tmp/tmp/tmp",
        "username": "user-haha",
        "locpath": "/path/to/some/dir/ok.py",
        "descr": "testing, 2016 0523"
        })
