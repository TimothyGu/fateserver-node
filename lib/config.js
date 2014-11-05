/*
 * Adjustable settings.
 *
 * Copyright (c) 2014 Tiancheng "Timothy" Gu <timothygu99@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * @file Adjustable settings of fateserver.
 * @module ./lib/config
 */

var c = {}
// You can change the following.
c.dir  = '/home/timothy_gu/fateserver-node/results'
c.port = 8080
c.branding = 'FFmpeg'
// c.getGitwebCommit = function(rev) {}
// c.getGitwebHist   = function(newer, older) {}

// Please DO NOT change the following.

/**
 * Environment the server is running in.
 * @type {string}
 */
module.exports.env      = process.env.NODE_ENV || c.env || 'production'

/**
 * Directory with all the fate data.
 * @type {string}
 */
module.exports.dir      = process.env.FATEDIR || c.dir || '/var/www/fateweb'

/**
 * Port to listen on.
 * @type {number}
 */
module.exports.port     = process.env.PORT    || c.port || 80

/**
 * Branding of the project using fateserver.
 * @type {string}
 */
module.exports.branding = c.branding || 'FFmpeg'

/**
 * @function getGitwebCommit
 * Get the Gitweb URL of a commit.
 *
 * @param rev {string} Revision of which Gitweb URL is to be returned. It
 *                     should contain enough information/hash for Gitweb to
 *                     understand.
 * @return    {string} The Gitweb URL of the input commit.
 *
 * @static
 */
module.exports.getGitwebCommit = c.getGitwebCommit || function(rev) {
    return 'http://git.videolan.org/?p=ffmpeg.git;a=commit;h=' + rev.trim()
}

/**
 * @function getGitwebHist
 * Get the Gitweb URL of a piece of history between two commits or from
 * one commit back.
 *
 * @param newer   {string} Revision of the newer commit.
 * @param [older] {string} Revision of the older commit.
 * @return        {string} The Gitweb URL of the history.
 *
 * @static
 */
module.exports.getGitwebHist = c.getGitwebHist || function(newer, older) {
    var end = older ? ';hp=' + older : ''
    return 'http://git.videolan.org/?p=ffmpeg.git;a=shortlog;h=' + newer + end
}
