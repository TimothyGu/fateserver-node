/*
 * History page routines.
 */

'use strict'

var fs       = require('fs')
  , join     = require('path').join
  , async    = require('async')
  , router   = require('express').Router()

var util     = require('../lib/util')
  , parse    = require('../lib/parse')
  , ts       = require('../lib/timestamp')
  , sort     = require('../lib/sort')

var nEntries = 50

function handleHistory (slot, begin, res, next) {
  begin = +begin || 0
  var slotdir = join(util.dir, slot)
  res.set('Cache-Control', 'public, max-age=60') // one minute

  fs.readdir(slotdir, function handleFiles (err, files) {
    if (err) {
      err.message = 'Slot "' + slot + '" not found.'
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
        res.render('history.ejs')
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
