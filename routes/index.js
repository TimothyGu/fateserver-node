/*
 * Index page.
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
  , debug    = require('debug')('f:r:index')
  , async    = require('async')

var config   = require('../lib/config')
  , parse    = require('../lib/parse')
  , ts       = require('../lib/timestamp')
  , sort     = require('../lib/sort')

function handleIndex (req, res, next) {
    fs.readdir(config.dir, function handleSlots (err, slots) {
        if (err) {
            err.message = 'config.dir not found. Did you set up lib/config.js'
                        + 'correctly?'
            err.HTMLMessage = 'FATE data not found.'
            err.status = 404
            return next(err)
        }
        // For every slot get the summary of the latest results.
        async.map(slots, function iterator (slot, out) {
            var slotdir = path.join(config.dir, slot)

            // If the slot is marked as hidden then skip over it.
            // All the null members of the array will be cleaned in end().
            if (fs.existsSync(path.join(slotdir, 'hidden'))) {
                return out(null, null)
            }

            // Load summary
            parse.loadSummary(slot, 'latest',
                              function summaryCb (err, summary) {
                // Ignore possible errors in one specific report in order
                // not to destroy the entire history page.
                return out(null, err ? null : summary)
            })
        }, function end (err, reps) {
            var sortingKeys = ['subarch', 'os', 'cc', 'comment', 'slot']
            if (req.query.sort) {
                // Put it as the first sorting key
                sortingKeys.unshift(req.query.sort)
                // Remove any redundant or conflicting keys from default
                var regex = new RegExp('(desc-)?' + req.query.sort)
                for (var i = 1; i < sortingKeys.length; i++) {
                    if (sortingKeys[i].match(regex)) {
                        sortingKeys[i] = null
                    }
                }
            }
            res.locals.sortEnabled = true
            res.locals.sort = sort.matchDesc(req.query.sort)
            res.locals.reps =
                reps.filter(function (n) {  // Filter out null/invalid ones
                        return n != null
                    })
                    .sort(sort.byKeys(sortingKeys))
            res.render('index.ejs', { _with: false })
        })
    })
}

module.exports = handleIndex
