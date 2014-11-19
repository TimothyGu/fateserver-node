/*
 * Sorting utilities.
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
 * @file Report-sorting utilities.
 * @module lib/timestamp
 */

'use strict'

var moment = require('moment')

var config = require('./config')

/**
 * Callback for `Array.prototype.sort()` that sorts
 * {@link module:lib/parse.Summary}'s by a specified key.
 *
 * @example
 * var reps = [ parse.loadSummary('my-slot',   20140101000000),
 *              parse.loadSummary('otro-slot', 20140201010111) ]
 * // Sort `reps` by reversed chronological order
 * reps.sort(sort.sortBy('date')).reverse()
 * 
 */
module.exports.sortBy = function(sortKey) {
    return function(a, b) {
        if (a[sortKey] == b[sortKey])
            return 0
        else if (a[sortKey] > b[sortKey])
            return 1
        else
            return -1
    }
}
