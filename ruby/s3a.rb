
#AWS.config(
#  :access_key_id => 'YOUR_ACCESS_KEY_ID',
#  :secret_access_key => 'YOUR_SECRET_ACCESS_KEY')


require 'aws-sdk'

require 'json'

s3 = AWS::S3.new


#puts s3.buckets.methods

#s3.buckets.each do |bucket|
#  puts bucket.name
#end

puts s3.buckets['ggfsb'].name

ggfsb = s3.buckets['ggfsb']

abc_meta = ggfsb.objects['.gg.folder.meta/abc']

str = abc_meta.read

j   = JSON.parse(str)
puts "#{j['name']}, j['name']."

puts str[0..300]

## streaming download from S3 to a file on disk
#File.open('/tmp/rbgetabc.json', 'wb') do |file|
#  abc_meta.read do |chunk|
#     file.write(chunk)
#  end
#end

