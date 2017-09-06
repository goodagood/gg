
.PHONY : folder_setup  now  target  member  folder_delete  folder  \
	folder_setup mis img

now :   folder folder_setup folder_delete folder folder_setup mis img
	echo 'Currently, u-folder-v5a.js should get pass'

msg : u-msg.js
	nodeunit u-msg.js

add : u-folder-add-folder.js
	echo 'no thing'


target: u-people.js
	#timeout 30s nodeunit u-people.js
	nodeunit u-people.js

member: #u-member.js
	timeout 30s nodeunit u-member.js

folder_delete : u-folder-v5-delete.js
	nodeunit u-folder-v5-delete.js

folder : folder_setup
	nodeunit u-folder-v5a.js

folder_setup : u-folder-pre.js uf-assure.js uf-lock.js
	nodeunit u-folder-pre.js
	nodeunit uf-assure.js
	nodeunit uf-lock.js

img : u-image.js
	nodeunit u-image.js

mis : u-rbasic.js u-bucket.js u-client-json-filter.js
	nodeunit u-rbasic.js
	nodeunit u-bucket.js
	nodeunit u-client-json-filter.js

