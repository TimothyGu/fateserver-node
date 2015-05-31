/*
 * History page routines.
 */

'use strict'

var Promise  = require('bluebird')
  , fs       = Promise.promisifyAll(require('fs'))
  , join     = require('path').join
  , router   = require('express').Router()

var util     = require('../lib/util')
  , parse    = require('../lib/parse')
  , ts       = require('../lib/timestamp')
  , sort     = require('../lib/sort')

var nEntries = 50

function noop () {}

function handleHistory (slot, begin, res, next) {
  begin = +begin || 0
  var slotdir = join(util.dir, slot)
  res.set('Cache-Control', 'public, max-age=60') // one minute

  fs.readdirAsync(slotdir).then(function (files) {
    res.locals.slot     = slot
    res.locals.begin    = begin
    res.locals.nEntries = nEntries
    var repsNames = files.filter(function (val) {
      return val.match(/^[0-9]/)
    }).sort().reverse()

    res.locals.total = repsNames.length
    repsNames = repsNames.slice(begin, begin + nEntries)

    // For every report, load its summary asynchronously
    return Promise.props({
      reps: Promise.map(repsNames, function (repName) {
        return parse.loadSummary(slot, repName).catch(noop)
      })
    , owner: parse.getSlotOwner(slot).catch(noop)
    }).then(function (results) {
      // reps is an array of all summaries
      res.locals.reps  =
        results.reps
          .filter(function (n) {
            // Filter out empty/invalid ones
            return n != null
          })
      res.locals.owner = results.owner
      res.render('history.ejs')
    })
  }, function (err) {
    err.message = 'Slot "' + slot + '" not found.'
    err.status = 404
    return next(err)
  }).catch(next)
}

router.get('/history/:slot', function (req, res, next) {
  handleHistory(req.params.slot, req.query.begin, res, next)
})
router.get('/history.cgi', function (req, res, next) {
  handleHistory(req.query.slot, req.query.begin, res, next)
})

module.exports = router
