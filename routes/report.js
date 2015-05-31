/*
 * Report page routines.
 */

'use strict'

var fs       = require('fs')
  , join     = require('path').join
  , async    = require('async')
  , router   = require('express').Router()

var util     = require('../lib/util')
  , parse    = require('../lib/parse')

function handleReport (slot, date, res, next) {
  if (!slot || !date) {
    var err = new Error('Slot or date not specified')
    err.status = 404
    return next(err)
  }

  res.set('Cache-Control', 'public, max-age=86400') // a week
  res.locals.slot = slot
  res.locals.date = date

  async.parallel({
    owner: parse.getSlotOwner.bind(null, slot)
  , summary: parse.loadSummary.bind(null, slot, date)
  , report: parse.loadReport.bind(null, slot, date, 0)
  , lastpass: parse.loadLastPass.bind(null, slot)
  , prevDate: function (callback) {
      fs.readdir(join(util.dir, slot), function (err, files) {
        if (err) {
          err.message = 'Slot "' + slot + '" not found.'
          err.status = 404
          return callback(err)
        }

        var runs = files
          .filter(function (val) {
            return val.match(/^[0-9]/)
          })
          .sort()

        var prevIndex = runs.indexOf(date) - 1
        callback(null, prevIndex >= 0
                     ? Number(runs[prevIndex])
                     : null)
      })
    }
  }, function (err, results) {
    if (err) return next(err)
    res.render('report.ejs', results)
  })
}

router.get('/report/:slot/:time', function (req, res, next) {
  handleReport(req.params.slot, req.params.time, res, next)
})
router.get('/report.cgi', function (req, res, next) {
  handleReport(req.query.slot, req.query.time, res, next)
})
module.exports = router
