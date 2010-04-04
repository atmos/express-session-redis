Express-Session-Redis
=====================

Currently [express][express] sessions only live in memory.  This allows for persistent sessions info to be stored in [redis][redis].

You Need
========

* [kiwi][kiwi]
* [redis][redis]
* [redis-client][redis-client]

Install Kiwi Dependencies
=========================
    % kiwi install express
    % kiwi install redis-client
    % kiwi install express-session-redis

Running
========

Setting this enviornmental variable to true flushes the db everytime

    % export MIGRATE_EXPRESS_SESSIONS=true

Testing
=======

    % bin/spec

[kiwi]: http://github.com/visionmedia/kiwi
[express]: http://github.com/visionmedia/express
[redis]: http://code.google.com/p/redis/
[redis-client]: http://github.com/fictorial/redis-node-client
