
#
# File permission
# Meta permission
#

class Permission:
    def __init__(self, owner=None):
        self._owner   = owner
        self._readers = []
        self._writers = []
        self._runners = []

        #self._member = []
        #self._viewer = []

        self._is_readable = False # every one can read
        self._no_owner    = False # every one can read/write/run

        if self._owner == None:
            self._is_readable = True
            self._no_owner    = True

        #self.data = {"owner": owner}
        pass


    def get_settings(self):
        return dict( owner = self._owner,
                readers = self._readers,
                writers = self._writers,
                runners = self._runners,
                is_readable = self._is_readable,
                no_owner = self._no_owner
                )


    def setup(self, conf):
        #if type(conf) is not dict:
        #    raise Exception('not a dict input')

        if 'owner' in conf:
            self._owner = conf['owner']
        if 'readers' in conf:
            self._readers = conf['readers']
        if 'writers' in conf:
            self._writers = conf['writers']
        if 'runners' in conf:
            self._runners = conf['runners']
        if 'is_readable' in conf:
            self._is_readable = conf['is_readable']
        if 'no_owner' in conf:
            self._no_owner = conf['no_owner']


    def set_owner(self, username):
        self._owner = username

    def is_owner(self, username):
        return self._owner == username

    def add_reader(self, name):
        if type(name) is str:
            self._readers.append(name)


    def add_readers(self, names):
        if type(names) is str:
            self._readers.append(names)

        # Think names is a list
        self._readers += names


    def rm_readers(self, names):
        self._readers = list(set(self._readers) - set(names))


    def add_writers(self, names):
        self._writers += names

    def rm_writers(self, names):
        self._writers = list(set(self._writers) - set(names))


    def can_be_read_by(self, username):
        if self.is_owner(username):
            return True
        if self._no_owner:
            return True
        if self._is_readable:
            return True
        if '*' in self._readers:
            self._is_readable = True
            return True

        if username in self._readers:
            return True

        if '*' in self._writers:
            self._readers.append('*')
            self._is_readable = True
            return True

        if username in self._writers:
            return True

        return False


    def can_be_written_by(self, username):
        if self.is_owner(username):
            return True
        if self._no_owner:
            return True

        if '*' in self._writers:
            self._readers.append('*')
            self._is_readable = True
            return True

        if username in self._writers:
            return True

        return False


    def can_be_run_by(self, username):
        if self.is_owner(username):
            return True
        if self._no_owner:
            return True

        if '*' in self._runners:
            self._readers.append('*')
            self._is_readable = True
            return True

        if username in self._runners:
            return True

        return False



if __name__ == "__main__":
    from pprint import pprint

    #p = Permission('abc')
    #p.add_readers(['tmp', 'aa'])
    #pprint(p.get_settings())


    conf = {'is_readable': False,
            'no_owner':    False,
            'owner':   'abc',
            'readers': ['tmp', 'aa'],
            'runners': [],
            'writers': []}
    p2 = Permission()
    p2.setup(conf)
    pprint(p2.get_settings())
    pprint(p2.can_be_read_by('tmp'))
    pprint(p2.can_be_written_by('abc'))
    pass
