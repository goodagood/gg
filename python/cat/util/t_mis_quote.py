
import unittest
import util.mis as mis

class TestUtilMisQuote(unittest.TestCase):
    def testQuote_1(self):
        q = mis.Quote()

        self.assertTrue(q.key == 'key')
        self.assertTrue(q.key_with_underscore == 'key_with_underscore')
        self.assertTrue(q.key_with_underscore == "key_with_underscore")

        self.assertTrue(q.AnyKey == 'AnyKey')
        self.assertTrue(q.AnyKey_with_underscore == 'AnyKey_with_underscore')
        self.assertTrue(q.AnyKey_with_underscore == "AnyKey_with_underscore")

        # q.some will return "some", it leads to "some" - other,
        # where other is not defined name
        with self.assertRaises(NameError):
            q.some-other

        # "some".other
        with self.assertRaises(AttributeError):
            q.some.other



if __name__ == "__main__":
    unittest.main()
