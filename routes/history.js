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

'use strict'

var fs       = require('fs')
  , path     = require('path')
  , debug    = require('debug')('f:r:history')
  , async    = require('async')

var config   = require('../lib/config')
  , parse    = require('../lib/parse')
  , ts       = require('../lib/timestamp')

var nEntries = 50

function handleHistory(slot, begin, res, next) {
    var slotdir = path.join(config.dir, slot)

    var repsName = []

    fs.readdir(slotdir, function(err, files) {
        if (err) {
            err.HTMLMessage = 'Slot "' + slot + '" not found.'
            err.status = 404
            return next(err)
        }

        res.locals.slot     = slot
        try {
            res.locals.owner = parse.getSlotOwner(slot)
        } catch (errInner) {
            return next(errInner)
        }

        repsName = files.filter(function(val) {
            return val.match(/^[0-9]/)
        })
        res.locals.begin    = Number(begin)
        res.locals.nEntries = nEntries

        async.map(repsName, function iterator(repName, out) {
            parse.loadSummary(slot, repName, function summaryCb(err, summary) {
                // Ignore possible errors in one specific report in order
                // not to destroy the entire history page.
                return out(null, err ? null : summary)
            })
        }, function end(err, reps) {
            res.locals.reps  =
                reps.filter(function(n){  // Filter out empty/invalid ones
                      return n != null
                  }).sort(ts.sortByDate)  // Oldest to newest
                    .reverse()            // Newest to oldest
                    .slice(begin, begin + nEntries)
            res.locals.total = reps.length
            res.render('history.ejs', { _with: false })
        })
    })
}

module.exports = handleHistory
