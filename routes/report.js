/*
 * Report page routines.
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
  , debug    = require('debug')('f:r:report')
  , async    = require('async') 

var config   = require('../lib/config')
  , parse    = require('../lib/parse')

function handleReport(slot, date, res, next) {
    var repdir = path.join(config.dir, slot, date)

    var reps = [], repsJSON = []

    if (!slot || !date) {
        var err = new Error('Slot or date not specified')
        err.status = 404
        return next(err)
    }
    res.locals.slot = slot
    res.locals.date = date
    try {
        res.locals.owner = parse.getSlotOwner(slot)
    } catch (err) {
        return next(err)
    }

    async.parallel({
        summary: function(callback) {
            parse.loadSummary(slot, date, callback)
        }
      , report: function(callback) {
            parse.loadReport(slot, date, callback)
        }
      , lastpass: function(callback) {
            parse.loadLastPass(slot, callback)
        }
    }, function(err, results) {
        if (err) {
            return next(err)
        } else {
            // .render() supports both options and locals
            // Putting an option into the locals object.
            results._with = false
            res.render('report.ejs', results)
        }
    })
}

module.exports = handleReport
