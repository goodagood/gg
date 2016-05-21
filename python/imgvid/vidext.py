
import os
import subprocess32 as sp


# extract image
# ffmpeg -i input.flv -ss 00:00:14.435 -vframes 1 out.png
def clone(vid_file_path, out_file_path):
    '''
    input file: vid_file_path, output file: out_file_path, ext included.

    All path should be full path if not working in current dir.
    '''
    if os.path.exists(out_file_path):
        os.remove(out_file_path)

    command = [
            'ffmpeg',
            '-i', vid_file_path,
            out_file_path
            ]

    yes = sp.Popen(['yes'], stdout=sp.PIPE)

    sp.Popen(command, stdin=yes.stdout)
    yes.stdout.close()
    return
    # test, 2016 0506


if __name__ == "__main__":
    vidfile = '/tmp/bulls.2.mp4'
    out     = '/tmp/b2.webm'

    clone(vidfile, out)
