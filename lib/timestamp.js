/*
 * Timestamp utilities.
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

// if (util.env === 'development') {
module.exports.HIDDEN_AGE  = 999999999999
//}

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
  if (tsMoment.unix() + module.exports.ANCIENT_AGE < moment.utc().unix()) {
    // If older than ANCIENT_AGE then return long date...
    return tsMoment.format('YYYY-MM-DD')
  } else {
    // or else return the time from now.
    return tsMoment.fromNow()
  }
}
