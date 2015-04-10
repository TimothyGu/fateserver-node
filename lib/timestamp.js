/**
 * @file Timestamp-related utilities.
 * @module lib/timestamp
 */

'use strict'

var moment = require('moment')

var util   = require('./util')

/**
 * @typedef {number} Timestamp
 *
 * A FATE timestamp is a number that has the format:
 *
 *     YYYYMMDDHHMMSS
 *
 * The FATE timestamp is always in UTC.
 *
 * You can parse, format, and manipulate timestamps with ease through the
 * external [moment module](http://momentjs.com/docs/), with the use of
 * {@link module:lib/timestamp.timestampFormatStr} and helper function
 * {@link module:lib/timestamp.getMoment}.
 */

/**
 * @const {number} RECENT_AGE
 * Number of seconds of age for a result to be considered recent.
 * @static
 * @default an hour
 */
module.exports.RECENT_AGE  = 3600

/**
 * @const {number} ANCIENT_AGE
 * Number of seconds of age for a result to be considered ancient.
 * @static
 * @default three days
 */
module.exports.ANCIENT_AGE = 3 * 86400

/**
 * @const {number} HIDDEN_AGE
 * Number of seconds of age for a result to be hidden forever.
 * @static
 * @default 30 days
 */
module.exports.HIDDEN_AGE  = 30 * 86400

if (util.env === 'development') {
  module.exports.HIDDEN_AGE  = 999999999999
}

/**
 * @const {string} timestampFormatStr
 * Formatting string to pass to moment module, that formats the FATE timestamp
 * from the clients. Remember to always use `moment.utc()` when using moment
 * parsing functions from moment.
 *
 * @static
 * @default 'YYYYMMDDHHmmss'
 */
module.exports.timestampFormatStr = 'YYYYMMDDHHmmss'
var timestampFormatStr = module.exports.timestampFormatStr

/**
 * Get a moment instance from a FATE timestamp.
 *
 * @param timestamp {Timestamp} The input timestamp.
 * @return                      The resulting moment instance.
 */
module.exports.getMoment = function getMoment (timestamp) {
  return moment.utc(timestamp.toString(), timestampFormatStr)
}

module.exports.formatDate = function formatDate (tsMoment) {
  var now = moment.utc().unix()
    , ts  = tsMoment.unix()
    , out = '<time datetime="' + tsMoment.format() + '">'
  if (ts + module.exports.ANCIENT_AGE < now) {
    // If older than ANCIENT_AGE then return long date...
    out += tsMoment.format('YYYY-MM-DD')
  } else if (ts > now) {
    // or else if timestamp is in the future, for whatever reason...
    out += 'just now'
  } else {
    // or else return the time from now.
    out += tsMoment.fromNow()
  }
  return out + '</time>'
}
