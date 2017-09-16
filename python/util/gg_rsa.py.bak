# Create rsa keys

import binascii
from time import time as micro

import rsa

import s3.file.klass


#(pub, priv) = rsa.newkeys(1024)
#
#pempub  = pub.save_pkcs1()
#print('pempub: ', pempub)
#pempriv = priv.save_pkcs1()
#print('pempriv: ', pempriv)


def keyfile(fpath, owner, pem):
    #fpub = s3.file.klass.File('tmp/gg/gg.pub.key')
    f = s3.file.klass.File(fpath)
    f.meta['owner'] = owner
    f.calculate_keys()
    f.write(pem)
    f.add_to_folder_ns()


def get_pub_key(username):
    fpath = username + '/gg/gg.public.key'
    f = s3.file.klass.File(fpath)
    pkcs = f.read()
    print('readed: ', pkcs)
    pub = rsa.PublicKey.load_pkcs1(pkcs)
    return pub



def verify_milli(pub, milli, signature):
    now = int(micro() * 1000)

    given_milli = int(milli)
    lap = now - given_milli

    try:
        v = rsa.verify(milli, signature, pub)
    except:
        v = False

    return (v, lap)


def verify_milli_for_user(username, milli, hexed_signature):
    pub = get_pub_key(username)
    signature = binascii.unhexlify(hexed_signature)
    return verify_milli(pub, milli, signature)


if __name__ == "__main__":
    import s3.folder.getter
    pass
    #keyfile('tmp/gg/gg.public.key', 'tmp', pempub)
    #keyfile('tmp/gg/gg.private.key', 'tmp', pempriv)
    #gg = s3.folder.getter.folder('tmp/gg')
    #cache_render_from_ns(gg)

    get_pub_key('tmp')
