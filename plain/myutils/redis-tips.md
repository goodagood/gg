
# through ssh tunnel might be best?

In this answer I assume that default redis port (6379) is used. You might
create a tunnel via ssh so localhost->6379 will point to
mydomainwhatever.net:6379 using this command:

    ssh -L 6379:localhost:6379 user@mydomainwhatever.net

Then you might connect to localhost:6379 using redis client.

see there can be limition, one of it could be:

    /etc/ssh/sshd_config:
    MaxSessions 1?

search 'ssh tunnel limitation' for it.
