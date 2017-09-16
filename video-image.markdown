
# How to extract images from a Video using FFmpeg


Extracting images from a video depends upon the frames we are considering per
second and then using that frame to output an image. So, here we need to
control the frame rate, image format and in case you want a specific resolution
of the image, you can do that by setting the frame size which is explained
later.

This command is the most basic way of extracting images from a Video.

    [shredder12]$ ffmpeg -i inputfile.avi -r 1 -f image2 image-%3d.jpeg

Now, let us see what all these different flags in the above command means.

    -r  This is used to set the frame rate of video. i.e. no. of frames to be
        extracted into images per second. The default value is 25, using which,
        would have yielded a large number of images.

    -f  This option defines the format we want to force/use, although removing
        this option shouldn't  cause any problem.

    image-%3d.jpeg  By %3d, we mean that we want the naming of the image files
        to be of the format "image-001.jpeg, image-002.jpeg.." and so on. If we had
        used image-%2d the names would have been image-01.jpeg, image-02.jpeg. You
        can use any format as per your choice.

We can also define the image size of the extracted images using the -s flag.
The default option is to use the image size same as the video resolution.

    [shredder12]$ ffmpeg -i inputfile.avi -r 1 -s 4cif -f image2 image-%3d.jpeg

4cif options stands for the frame size 704x576. There are a variety of options
that you can use.

        sqcif   128x96      qcif    176x144     cif     352x288
        4cif    704x576     qqvga   160x120     qvga    320x240
        vga     640x480     svga    800x600     xga     1024x768
        uxga    1600x1200   qxga    2048x1536   sxga    1280x1024
        qsxga   2560x2048   hsxga   5120x4096   wvga    852x480
        wxga    1366x768    wsxga   1600x1024   wuxga   1920x1200
        woxga   2560x1600   wqsxga  3200x2048   wquxga  3840x2400
        whsxga  6400x4096   whuxga  7680x4800   cga     320x200
        hd480   852x480     hd720   1280x720    hd1080  1920x1080

Now, if you want to set the duration for which image extraction will take
place, you can use the '-t' option to set the duration in seconds.

    [shredder12]$ ffmpeg -i inputfile.avi  -r  1  -t  4  image-%d.jpeg

Since, we are forcing 1 frame per second and the duration is only 4 seconds,
the images extracted will be 4.

If you want to start the extraction from particular point, say 01:30:14 in the
video for a specific duration(40 seconds), you can easily do it using the
combination of '-ss' and '-t'. This should do it for you.

    [shredder12]$ ffmpeg -i inputfile.avi  -r 1 -t  40 -ss  01:30:14 image-%d.jpeg

You can even set the number of video frames to record using '-vframes' flag.

    [shredder12]$ ffmpeg -i inputfile.avi  -r 1 -vframes 120 -ss  01:30:14 image-%d.jpeg

This will record 120 frames of the video starting from 1:30:14 at 1frames per
second. So, after 120 seconds, you should have 120 images.


