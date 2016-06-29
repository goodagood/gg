
import ggroot.permission.per as gp


if __name__ == "__main__":
    from pprint import pprint



    conf = {
            'owner': 'John',
            'readers': ['tAm', 'aa'],
            'runners': [],
            'writers': []
            }
    p = gp.Permission(conf)

    p.add_readers(['tmp', 'bb'])
    pprint(p.get_settings())

    print('-- p2 --')
    p2 = gp.Permission('tom')
    #p2.setup(conf)
    pprint(p2.get_settings())
    pprint(p2.can_be_read_by('tmp'))
    pprint(p2.can_be_written_by('abc'))
    p2.add_readers(['sam', 'dog', 'cat'])
    p2.add_runners(['sam', 'dog', 'cat'])
    p2.add_writers(['sam', 'dog', 'cat'])
    p2.rm_writers(['sam', 'cat'])
    p2.rm_writers('sam')
    pprint(p2.get_settings())
    pass

