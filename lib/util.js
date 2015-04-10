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

module.exports.log = c['access.log'] || path.resolve(__dirname, '..', 'node-access.log')

module.exports.proxy = !!c.proxy || false
