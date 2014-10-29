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

var moment = require('moment')

module.exports.recentAge  = 3600       // an hour
module.exports.ancientAge = 3 * 86400  // three days
//module.exports.hiddenAge = 30 * 86400  // 30 days
module.exports.hiddenAge  = 999999999999

// Accepts two object returned by loadSummary().
// Example:
//     reps.sort(sortByDate).reverse() // Reversed chronological order
function sortByDate(a,b) {
    if (a.date == b.date)
        return 0
    else if (a.date > b.date)
        return 1
    else
        return -1
}
module.exports.sortByDate = sortByDate

// Formatting string to pass to moment module, that formats the timestamp
// from the clients. Remember to always use
//     moment.utc()
// when parsing.
var timestampFormatStr = 'YYYYMMDDHHmmss'
module.exports.timestampFormatStr = timestampFormatStr

// Get a moment instance from a timestamp.
function getMoment(timestamp) {
    return moment.utc(timestamp.toString(), timestampFormatStr)
}
module.exports.getMoment = getMoment
