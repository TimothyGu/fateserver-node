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

var moment = require('moment')

'use strict'

var config = require('./config')

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
 * Number of seconds of age for a result to be considered recent.
 * @type {number}
 */
module.exports.recentAge  = 3600       // an hour
/**
 * Number of seconds of age for a result to be considered ancient.
 * @type {number}
 */
module.exports.ancientAge = 3 * 86400  // three days
/**
 * Number of seconds of age for a result to be hidden forever.
 * @type {number}
 */
module.exports.hiddenAge  = 30 * 86400  // 30 days

// if (config.env === 'development') {
module.exports.hiddenAge  = 999999999999
//}

/**
 * Callback for `Array.prototype.sort()` that sorts
 * {@link module:lib/parse.Summary}'s by chronological order.
 *
 * @example
 * var reps = [ parse.loadSummary('my-slot',   20140101000000),
 *              parse.loadSummary('otro-slot', 20140201010111) ]
 * // Sort `reps` by reversed chronological order
 * reps.sort(sortByDate).reverse()
 * 
 */
module.exports.sortByDate = function(a,b) {
    if (a.date == b.date)
        return 0
    else if (a.date > b.date)
        return 1
    else
        return -1
}

/**
 * Formatting string to pass to moment module, that formats the FATE timestamp
 * from the clients. Remember to always use `moment.utc()` when using moment
 * parsing functions from moment.
 *
 * @type {string}
 */
module.exports.timestampFormatStr = timestampFormatStr = 'YYYYMMDDHHmmss'

/**
 * Get a moment instance from a FATE timestamp.
 *
 * @param timestamp {Timestamp} The input timestamp.
 * @return                      The resulting moment instance.
 */
module.exports.getMoment = function getMoment(timestamp) {
    return moment.utc(timestamp.toString(), timestampFormatStr)
}
