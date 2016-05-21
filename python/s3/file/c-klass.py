
import s3.file.klass
import s3.file.getter


from pprint import pprint

if __name__ == "__main__":
    ''
    #file_path = 'tmp/public/cat-food.mp4'

    def check_file(file_path):
        print("\r\ncheck file path: %s\r\n"%file_path)
        f = s3.file.getter.file_with_meta(file_path)
        print('meta exists: ', f.is_meta_in_s3())
        #pprint(f.meta)
        return f

    #f = s3.file.getter.file_with_meta(file_path)
    #if f.is_meta_in_s3():
    #    f.delete_meta_file()
    #if f.is_name_space_used():
    #    f.delete_name_space()

    #file_path = 'tmp/public/tt1.mp4'
    #f = s3.file.getter.file_with_meta(file_path)
    #pprint(f.meta)

    fp1 = 'tmp/public/cat-food.mp4'
    fp2 = 'tmp/public/cat-dog.mp4'
    fp3 = 'tmp/public/cats2014.mp4'
    fp4 = 'tmp/public/dog2014.mp4'
    fp5 = 'tmp/public/tt1.webm'
    fp6 = 'tmp/public/tt1.mp4'

    f1 = check_file(fp1)
    f1a= s3.file.klass.File(fp1)
    f2 = check_file(fp2)
    f3 = check_file(fp3)
    f4 = check_file(fp4)
    f5 = check_file(fp5)
    f6 = check_file(fp6)

