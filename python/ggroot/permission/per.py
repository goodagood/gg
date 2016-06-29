
#
# File permission
# Meta permission
#

import util.mis


class Permission:
    '''

    2016 0621
    self.c is a new data for config, which can be dot accessed.
    '''

    Default_config = {
            'owner': None,
            'root' : None,
            'readers': [],
            'writers': [],
            'runners': [],
            'setters': [],
            'is_readable': False
            }


    def __init__(self, owner_or_cfg):
        wehave = type(owner_or_cfg)
        if wehave == str:
            self.owner_create(owner_or_cfg)
        elif wehave == dict:
            return self.setup(owner_or_cfg)
        else:
            # we fail
            raise Exception('No owner no settings, no permission obj..')



    def owner_create(self, owner):
        if type(owner) != str:
            raise Exception('owner name must be string, in permission set..')

        conf = {'owner': owner}
        self.setup(conf)


    def get_settings(self):
        return self.c.toDict()


    def setup(self, config):
        ''' set/reset by parameter: config
        '''
        if type(config) is not dict:
            raise Exception('not a dict input')

        for k,v in Permission.Default_config.items():
            config.setdefault(k,v)
            pass

        self.c = util.mis.dotify(config)


    def set_owner(self, username):
        self.c.owner = username

    def set_root(self, username):
        self.c.root = username

    def is_owner(self, username):
        return self.c.owner == username

    def _has_no_owner(self):
        if type(self.c.owner) is str:
            return False

        if hasattr(self, '_no_owner'):
            return self.c.no_owner
        return  False


    def add(self, category, username):
        if category not in self.c:
            raise Exception("not a category name: %s"%category)
        if type(username) is str:
            self.c[category].append(username)
        if type(username) is list:
            self.c[category] += username


    def rm(self, category, username):
        if category not in self.c:
            raise Exception("not a category name: %s"%category)
        if type(username) is str:
            names = [username,]
        elif type(username) is list:
            names = username
        else:
            raise Exception("not a username or list of it to rm")

        self.c[category] = list(set(self.c[category]) - set(names))


    def add_reader(self, name):
        self.add('readers', name)

    def rm_reader(self, name):
        self.rm('readers', name)


    def add_writer(self, name):
        self.add('writers', name)

    def rm_writer(self, name):
        self.rm('writers', name)

    def add_runner(self, name):
        self.add('runners', name)

    def rm_runner(self, name):
        self.rm('runners', name)

    def add_setter(self, username):
        '''
        Add one or a list of users who can set (meta data)
        '''
        self.add('setters', username)

    def rm_setter(self, username):
        '''
        Remove one or a list of users who can set (meta data)
        '''
        self.rm('setters', username)


    def can_be_read_by(self, username):
        if self.is_owner(username):
            return True
        if self._has_no_owner():
            return True
        if self.c.is_readable:
            return True
        if '*' in self.c.readers:
            self.c.is_readable = True
            return True

        if username in self.c.readers:
            return True

        if '*' in self.c.writers:
            self.c.readers.append('*')
            self.c.is_readable = True
            return True

        if username in self.c.writers:
            return True

        return False


    def can_be_written_by(self, username):
        if self.is_owner(username):
            return True
        if self._has_no_owner():
            return True

        if '*' in self.c.writers:
            self.c.readers.append('*')
            self.c.is_readable = True
            return True

        if username in self.c.writers:
            return True

        return False


    def can_be_set_by(self, username):
        if self.is_owner(username):
            return True

        if username in self.c.setters:
            return True

        return False


    def can_be_run_by(self, username):
        if self.is_owner(username):
            return True
        if self._has_no_owner():
            return True

        if '*' in self.c.runners:
            return True

        if username in self.c.runners:
            return True

        return False



if __name__ == "__main__":
    from pprint import pprint

    #p = Permission('abc')
    #p.add_reader(['tmp', 'aa'])
    #pprint(p.get_settings())


    conf = {
            'readers': ['tom', 'aa'],
            'runners': [],
            'writers': []
            }

    p2 = Permission(owner="tmp")
    p2.setup(conf)
    pprint(p2.get_settings())
    pprint(p2.can_be_read_by('tmp'))
    pprint(p2.can_be_written_by('abc'))
    pass
