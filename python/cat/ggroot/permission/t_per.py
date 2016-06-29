
import unittest

import ggroot.permission.per as gp


class TestPermissionClass(unittest.TestCase):
    def test_from_owner(self):
        '''
        owner is 'tom'
        '''
        ptom = gp.Permission('tom')
        self.assertTrue(ptom.is_owner('tom'))
        self.assertFalse(ptom.is_owner('Tom'))

        seta = ptom.get_settings()
        self.assertTrue(type(seta) is dict)
        self.assertTrue('readers' in seta)
        self.assertTrue('writers' in seta)
        self.assertTrue('runners' in seta)
        self.assertTrue('setters' in seta)
        self.assertTrue('owner' in seta)

        self.assertTrue(ptom.can_be_read_by('tom'))
        self.assertFalse(ptom.can_be_read_by('Tom'))

        ptom.add('readers', 'Tom')
        self.assertTrue(ptom.can_be_read_by('Tom'))
        ptom.rm('readers', 'Tom')
        self.assertFalse(ptom.can_be_read_by('Tom'))

        ptom.add('readers', ['Tom', 'john'])
        self.assertTrue(ptom.can_be_read_by('Tom'))
        ptom.rm('readers', ['Tom', 'john'])
        self.assertFalse(ptom.can_be_read_by('Tom'))



    def test_readers_from_owner(self):
        '''
        owner is 'tom'
        '''
        ptom = gp.Permission('tom')
        self.assertTrue(ptom.is_owner('tom'))
        self.assertFalse(ptom.is_owner('Tom'))
        self.assertTrue(ptom.can_be_read_by('tom'))

        ptom.add_reader('Tom')
        self.assertTrue(ptom.can_be_read_by('Tom'))
        ptom.rm_reader('Tom')
        self.assertFalse(ptom.can_be_read_by('Tom'))

        ptom.add_reader( ['Tom', 'john'])
        self.assertTrue(ptom.can_be_read_by('Tom'))
        self.assertTrue(ptom.can_be_read_by('john'))
        ptom.rm_reader(['Tom', 'john'])
        self.assertFalse(ptom.can_be_read_by('Tom'))
        self.assertFalse(ptom.can_be_read_by('john'))


    def test_runners_from_owner(self):
        '''
        owner is 'tom'
        '''
        ptom = gp.Permission('tom')
        self.assertTrue(ptom.can_be_run_by('tom'))

        ptom.add_runner('Tom')
        self.assertTrue(ptom.can_be_run_by('Tom'))
        ptom.rm_runner('Tom')
        self.assertFalse(ptom.can_be_run_by('Tom'))

        ptom.add_runner( ['Tom', 'john'])
        self.assertTrue(ptom.can_be_run_by('Tom'))
        self.assertTrue(ptom.can_be_run_by('john'))
        ptom.rm_runner(['Tom', 'john'])
        self.assertFalse(ptom.can_be_run_by('Tom'))
        self.assertFalse(ptom.can_be_run_by('john'))



    def test_writer_from_owner(self):
        '''
        owner is 'tom'
        '''
        ptom = gp.Permission('tom')
        self.assertTrue(ptom.can_be_written_by('tom'))

        ptom.add_writer('Tom')
        self.assertTrue(ptom.can_be_written_by('Tom'))
        ptom.rm_writer('Tom')
        self.assertFalse(ptom.can_be_written_by('Tom'))

        ptom.add_writer( ['Tom', 'john', 'tmp'])
        self.assertTrue(ptom.can_be_written_by('Tom'))
        self.assertTrue(ptom.can_be_written_by('john'))
        self.assertTrue(ptom.can_be_written_by('tmp'))
        ptom.rm_writer(['Tom', 'john', 'tmp'])
        self.assertFalse(ptom.can_be_written_by('Tom'))
        self.assertFalse(ptom.can_be_written_by('john'))
        self.assertFalse(ptom.can_be_written_by('tmp'))


    def test_set_from_owner(self):
        '''
        owner is 'tom'
        '''
        ptom = gp.Permission('tom')
        self.assertTrue(ptom.can_be_set_by('tom'))

        ptom.add_setter('Tom')
        self.assertTrue(ptom.can_be_set_by('Tom'))
        ptom.rm_setter('Tom')
        self.assertFalse(ptom.can_be_set_by('Tom'))

        ptom.add_setter( ['Tom', 'john', 'tmp'])
        self.assertTrue(ptom.can_be_set_by('Tom'))
        self.assertTrue(ptom.can_be_set_by('john'))
        self.assertTrue(ptom.can_be_set_by('tmp'))
        ptom.rm_setter(['Tom', 'john', 'tmp'])
        self.assertFalse(ptom.can_be_set_by('Tom'))
        self.assertFalse(ptom.can_be_set_by('john'))
        self.assertFalse(ptom.can_be_set_by('tmp'))



if __name__ == "__main__":
    unittest.main()
