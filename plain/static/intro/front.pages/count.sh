find the_dir/ -name "file_name_pattern" -mtime -1 -print0 | du --files0-from=- -hc | tail -n1

find . -name "*.file_extension" -ls | awk '{total += $7} END {print total}'
