fateserver-node
===============

[![Dependency Status](https://david-dm.org/TimothyGu/fateserver-node.png)](https://david-dm.org/TimothyGu/fateserver-node)

This is a Node.js-based server for FATE, the FFmpeg Automated Testing
Environment (FFmpeg) or FATE Automated Testing Environment (Libav). It is
written with Express.js, EJS (Embedded Javascript) and a few other modules. It
is geared towards performance (compared to the old Perl CGI-based fateserver)
and extensibility (clean JS code and EJS templates).

Why Not Jade? It's so much cleaner...
-------------------------------------

It is not *that* cleaner than EJS, but a lot slower (up to 16x slower in my
test, i.e. even slower than the old fateserver).

See for yourself in the jade branch (only history page ported).

