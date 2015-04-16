/*
 * API.
 */

'use strict'

var fs       = require('fs')
  , path     = require('path')
  , readline = require('readline')
  , async    = require('async')
  , express  = require('express')

var util     = require('../lib/util')
  , parse    = require('../lib/parse')
  , ts       = require('../lib/timestamp')
  , sort     = require('../lib/sort')
  , cache    = require('../lib/cache')

var router = express.Router()

function handleReportAPI (req, res, next) {
  var slot    = req.params.slot
    , date    = req.params.date

  async.parallel({
    owner: parse.getSlotOwner.bind(null, slot)
  , summary: parse.loadSummary.bind(null, slot, date)
  , report: parse.loadReport.bind(null, slot, date, 0)
  , lastpass: parse.loadLastPass.bind(null, slot)
  , prevDate: function (callback) {
      fs.readdir(path.join(util.dir, slot), function (err, files) {
        if (err) {
          err.json = true
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
    res.json(results)
  })
}

function handleTestAPI (req, res, next) {
  var slot    = req.params.slot
    , date    = req.params.date
    , test    = req.params.test

  var cacheName = ['report', 'lut', slot, date].join('_')
  var cacheHasIt = false
  cache.lock.readLock(function (release) {
    if (cache.has(cacheName)) {
      var lut = cache.get(cacheName)
      cacheHasIt = true
      if (!lut.hasOwnProperty(test)) {
        var err = new Error('Test "' + test + '" not found')
        err.json = true
        err.status = 404
        next(err)
      } else {
        res.json(lut[test])
      }
    }
    release()
  })
  if (cacheHasIt) return
  parse.loadReport(slot, date, 2, function (err, obj) {
    var lut = {}
    for (var i = 0; i < obj.length; i++) {
      lut[obj[i].name] = obj[i]
    }
    cache.lock.writeLock(function (release) {
      cache.set(cacheName, lut)
      release()
    })
    if (lut.hasOwnProperty(test)) {
      return res.json(lut[test])
    }
    err.message = 'Test "' + test + '" not found'
    err.json = true
    err.status = 404
    next(err)
  })
}

router.get('/api/:slot/:date', handleReportAPI)
router.get('/api/:slot/:date/:test', handleTestAPI)

module.exports = router
