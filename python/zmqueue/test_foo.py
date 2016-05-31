
import test_a

# not ok:
#from . import test_b

import test_b

def foo():
    print('test_foo: foo in test_foo.py')


if __name__ == "__main__":
    test_a.foo()

    test_b.fun_in_test_b()
