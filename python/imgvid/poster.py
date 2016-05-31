
# 
# Use ffmpeg via subprocess to do video things
#

#import subprocess32 as sp
import subprocess as sp


# extract image
# ffmpeg -i input.flv -ss 00:00:14.435 -vframes 1 out.png
def make_poster(vid_file_path, start_time_str, out_img_path):
    ''' Get 1 image (poster) from video file, from time: start_time_str.

        All path should be full path if not working in current dir.
        time string format: hh:mm:ss.milli
    '''
    command = ['ffmpeg',
            '-i', vid_file_path,
            '-ss', start_time_str,
            '-vframes', '1',
            out_img_path
            ]
    #sp.call(command)

    yes = sp.Popen(['yes'], stdout=sp.PIPE)

    result = sp.Popen(command, stdin=yes.stdout)
    yes.stdout.close()
    result.communicate()
    # test, 2016 0506



if __name__ == "__main__":
    ''
    vidfile = '/tmp/tt1.mp4'
    def check_0415():
        vid_file = '/tmp/tt1.mp4'
        start_time_str = '00:00:05.000' # 10 second
        out_img_path = '/tmp/t1.png'

        get_poster(vid_file, start_time_str, out_img_path)

    #check_0415()
    #print vid_duration(vidfile)

    cmd = ["ffprobe", vidfile]

    result = sp.Popen(cmd, stdout = sp.PIPE, stderr = sp.STDOUT)
    #return [x for x in result.stdout.readlines() if "Duration" in x]

    #result = sp.check_output(cmd)
    #return [x for x in result.stdout.readlines() if "Duration" in x]

