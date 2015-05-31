/*
 * Report page routines.
 */

'use strict'

var Promise  = require('bluebird')
  , fs       = Promise.promisifyAll(require('fs'))
  , join     = require('path').join
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

  Promise.props({
    owner: parse.getSlotOwner(slot)
  , summary: parse.loadSummary(slot, date)
  , report: parse.loadReport(slot, date, 0)
  , lastpass: parse.loadLastPass(slot)
  , prevDate: fs.readdirAsync(join(util.dir, slot)).then(function (files) {
      var runs = files
        .filter(function (val) {
          return val.match(/^[0-9]/)
        })
        .sort()

      var prevIndex = runs.indexOf(date) - 1
      return prevIndex >= 0 ? Number(runs[prevIndex])
                            : null
    }, function (err) {
      err.message = 'Slot "' + slot + '" not found.'
      err.status = 404
      return Promise.reject(err)
    })
  }).then(res.render.bind(res, 'report.ejs'))
  .catch(next)
}

router.get('/report/:slot/:time', function (req, res, next) {
  handleReport(req.params.slot, req.params.time, res, next)
})
router.get('/report.cgi', function (req, res, next) {
  handleReport(req.query.slot, req.query.time, res, next)
})
module.exports = router
