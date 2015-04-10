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
  , async    = require('async')
  , router   = require('express').Router()

var util     = require('../lib/util')
  , parse    = require('../lib/parse')
  , ts       = require('../lib/timestamp')
  , sort     = require('../lib/sort')

var nEntries = 50

function handleHistory (slot, begin, res, next) {
  begin = +begin || 0
  var slotdir = path.join(util.dir, slot)
  res.setHeader('Cache-Control', 'public, max-age=60') // one minute

  fs.readdir(slotdir, function handleFiles (err, files) {
    if (err) {
      err.HTMLMessage = 'Slot "' + slot + '" not found.'
      err.status = 404
      return next(err)
    }

    res.locals.slot    = slot
    res.locals.begin    = begin
    res.locals.nEntries = nEntries
    var repsNames = files.filter(function (val) {
      return val.match(/^[0-9]/)
    }).sort().reverse()

    res.locals.total = repsNames.length
    repsNames = repsNames.slice(begin, begin + nEntries)

    // For every report, load its summary asynchronously
    async.map(repsNames, function iterator (repName, out) {
      parse.loadSummary(slot, repName, function summaryCb (err, summary) {
        // Ignore possible errors in one specific report in order
        // not to destroy the entire history page.
        return out(null, err ? null : summary)
      })
    }, function end (err, reps) {
      // reps is an array of all summaries
      res.locals.reps  =
        reps
          .filter(function (n) {
            // Filter out empty/invalid ones
            return n != null
          })
      parse.getSlotOwner(slot, function (e, owner) {
        res.locals.owner = owner
        res.render('history.ejs', { _with: false })
      })
    })
  })
}

router.get('/history/:slot', function (req, res, next) {
  handleHistory(req.params.slot, req.query.begin, res, next)
})
router.get('/history.cgi', function (req, res, next) {
  handleHistory(req.query.slot, req.query.begin, res, next)
})

module.exports = router
