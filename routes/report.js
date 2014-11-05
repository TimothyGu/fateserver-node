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

var fs       = require('fs'),
    path     = require('path'),
    debug    = require('debug')('report')

var config   = require('../lib/config'),
    parse    = require('../lib/parse')

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

    var otherProcessDone = false
    parse.loadSummary(slot, date, function(err, summary) {
        if (err)
            return next(err)
        else {
            res.locals.summary = summary
            if (otherProcessDone && !err) {
                res.render('report.ejs', { _with: false })
            } else
                otherProcessDone = true
        }
    })
    parse.loadReport(slot, date, function(err, records) {
        if (err) {
            debug('uh')
            return next(err)
        } else {
            res.locals.report = records
            if (otherProcessDone && !err) {
                res.render('report.ejs', { _with: false })
            } else
                otherProcessDone = true
        }
    })
}

module.exports = handleReport
