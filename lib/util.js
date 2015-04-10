/**
 * @file General utilities and settings.
 *
 * It also contains some helper functions to be used in EJS templates.
 *
 * @module lib/util
 */

'use strict'

var path = require('path')

/**
 * Directory with all the fate data.
 * @type {string}
 */
module.exports.dir      = '/var/www/fateweb'

/**
 * Port to listen on.
 * @type {number}
 */
module.exports.port     = 8080

/**
 * Branding of the project using fateserver.
 * @type {string}
 */
module.exports.branding = 'FFmpeg'

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

module.exports.formatConfig = function (str) {
  if (str == undefined) return ''
  return str.replace(/(?!^)--/g, '<br>--')
}

module.exports.log = path.resolve(__dirname, '..', 'logs', 'access.log')

module.exports.proxy = true

module.exports.cache = 10
