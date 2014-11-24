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
test without caching, i.e. even slower than the old fateserver).

If caching **is** enabled, and `with(){}` syntax is disabled, my tests show
that it is 1.7x slower.

See for yourself in the jade branch (only history page ported).

FooTable Version
----------------

fateserver-node uses the MIT-licensed FooTable library. However, it does not
have an npm package, so any update must be done manually.

The version of FooTable currently in the source tree is **2.0.3,** with some
minor font path changes in public/css/footable.core.min.css.

Prism Version
-------------

The Prism bundled with this copy of fateserver-node is generated on 2014-11-23
from http://prismjs.com/download.html?themes=prism&languages=git&plugins=line-numbers

TODO
----

1. Add proper compiler name parsing instead of showing
   "(Ubuntu 4.8.2-19ubuntu1)"
2. Port rest of style.less to ffmpeg-web.
