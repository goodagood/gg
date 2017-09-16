
# 
# Use ffmpeg via subprocess to do video things
#

#import subprocess32 as sp
import subprocess as sp


# extract image
# ffmpeg -i input.flv -ss 00:00:14.435 -vframes 1 out.png
def change_format(input_vid, output_vid):
    ''' input video to output video, such as example.mp4 -> example.webm

        All path should be full path if not working in current dir.
    '''
    command = ['ffmpeg',
            '-i', input_vid,
            output_vid
            ]
    sp.call(command)
    #print(command)



if __name__ == "__main__":
    ''
    vidfile = '/tmp/tt1.mp4'
    def check_0502():
        vid_file = '/tmp/tt1.mp4'
        output_vid = '/tmp/tt1.flv'

        change_format(vid_file, output_vid)

    check_0502()
    #print vid_duration(vidfile)


