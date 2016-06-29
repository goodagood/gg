
#a.py:

print "a in"
import sys
print "b imported: %s" % ("b" in sys.modules, )
import b
print "a out"

#b.py:

print "b in"
import a
print "b out"
x = 3
