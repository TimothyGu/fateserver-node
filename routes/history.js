/*
 * History page routines.
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

var fs       = require('fs'),
    path     = require('path'),
    debug    = require('debug')('history')

var config   = require('../lib/config'),
    parse    = require('../lib/parse'),
    ts       = require('../lib/timestamp')

var nEntries = 50

function handleHistory(slot, begin, res, next) {
    var slotdir = path.join(config.dir, slot)

    var reps = [], repsJSON = []

    fs.readdir(slotdir, function(err, files) {
        if (err) {
            var newErr = new Error('Slot "' + slot + '" not found.')
            newErr.status = 404
            // Use old stack trace
            newErr.stack = err.stack
            return next(newErr)
        }

        res.locals.slot     = slot
        try {
            res.locals.owner = parse.getSlotOwner(slot)
        } catch (errInner) {
            return next(errInner)
        }

        reps = files.filter(function(val) {
            return val.match(/^[0-9]/)
        })
        res.locals.begin    = Number(begin)
        res.locals.nEntries = nEntries
        res.locals.total    = reps.length

        // We need a separate counter for how many summaries are fetched.
        // i is for the summary we are fetch**ing**.
        var done = 0
        for (var i = 0; i < reps.length; i++) {
            parse.loadSummary(slot, reps[i], function(errInner, data) {
                if (errInner) {
                    return next(errInner)
                }
                repsJSON[done] = data
                if (done === reps.length - 1) {
                    res.locals.reps = repsJSON.sort(ts.sortByDate)
                                              .reverse()
                                              .slice(begin, begin + nEntries)
                    res.render('history.ejs', { _with: false })
                }
                done++
            })
        }
    })
}

module.exports = handleHistory
