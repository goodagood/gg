
import unittest

import s3.crud as crud
import s3.keys


class AccessTest(unittest.TestCase):

    def setUp(self):
        self.cwd = 'tmp/public'
        self.s3key = s3.keys.folder_meta(self.cwd)
        print ("setUp self: cwd s3key, %s %s "%(self.cwd, self.s3key))

    def testCalculation(self):
        self.assertEqual(type(self.cwd), str)
        self.assertTrue(type(self.s3key) is str)
        self.assertTrue(self.s3key is not '')
        self.assertEqual(1,1)

    def testExists(self):
        exists = crud.key_exists(self.s3key)
        self.assertTrue(exists)


    def testGetObj(self):
        obj = crud.get_obj(self.s3key)
        self.assertTrue('Body' in obj)
        self.assertTrue('ETag' in obj)
        self.assertTrue('ResponseMetadata' in obj)
        self.assertTrue( obj['ResponseMetadata']['HTTPStatusCode'] == 200)

        with self.assertRaises(Exception):
            should_not_exists = 'This.key.shoulD.nOt-exists in my s3 storage'
            crud.get_obj(should_not_exists)
            pass
        print('should not exists past')


    def tearDown(self):
        self.fib_elems = None
        print ("tearDown executed!")



if __name__ == "__main__":
    unittest.main()

