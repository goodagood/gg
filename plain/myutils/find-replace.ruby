# First set the files to search/replace in
files = Dir.glob("*js")
puts files

# Then set the variables for find/replace
@original_string_or_regex = /REGEX/
@replacement_string = "STRING"

#files.each do |file_name|
#    text = File.read(file_name)
#    replace = text.gsub!(@original_string_or_regex, @replacement_string)
#    #File.open(file_name, "w") { |file| file.puts replace }
#end
