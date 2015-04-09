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
 * @file General utilities.
 *
 * This file provides defaults and fallbacks to the configuration in config.js
 * in the root directory.
 *
 * It also contains some helper functions to be used in EJS templates.
 *
 * @module lib/util
 */

'use strict'

var path = require('path')

try {
  var c = require('../config.js')
} catch (ex) {
  // ignored
}

var debug = require('debug')('util')

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
 * Get the Gitweb URL of a piece of history between two commits or from
 * one commit back.
 *
 * @param newer   {string} Revision of the newer commit.
 * @param [older] {string} Revision of the older commit.
 * @return        {string} HTML code for a hyperlink to the URL of the history.
 */
module.exports.linkGitHist = function (newer, older) {
  var end = older ? ';hp=' + older : ''
  return '<a href="http://git.videolan.org/?p=ffmpeg.git;a=shortlog;h=' + newer + end + '">'
       +   (older ? older : newer)
       + '</a>'
}
module.exports.linkGitHist = c.linkGitHist || module.exports.linkGitHist

module.exports.formatConfig = function (str) {
  if (str == undefined) return ''
  return str.replace(/(?!^)--/g, '<br>--')
}

module.exports.log = config['access.log'] || path.resolve(__dirname, '..', 'node-access.log')
