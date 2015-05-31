/*
 * API.
 */

'use strict'

var Promise  = require('bluebird')
  , fs       = Promise.promisifyAll(require('fs'))
  , join     = require('path').join
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
      err.json = true
      err.message = 'Slot "' + slot + '" not found.'
      err.status = 404
      return Promise.reject(err)
    })
  }).then(res.json.bind(res))
  .catch(next)
}

function handleTestAPI (req, res, next) {
  var slot    = req.params.slot
    , date    = req.params.date
    , test    = req.params.test

  var cacheName = ['report', 'lut', slot, date].join('_')
  cache.lock.readLock(function (release) {
    if (cache.has(cacheName)) {
      var lut = cache.get(cacheName)
      if (!lut.hasOwnProperty(test)) {
        var err = new Error('Test "' + test + '" not found')
        err.json = true
        err.status = 404
        next(err)
      } else {
        res.json(lut[test])
      }
      return release()
    }
    release()
    parse.loadReport(slot, date, 2).then(function (obj) {
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
    }, function (err) {
      err.message = 'Test "' + test + '" not found'
      err.json = true
      err.status = 404
      next(err)
    }).catch(next)
  })
}

router.get('/api/:slot/:date', handleReportAPI)
router.get('/api/:slot/:date/:test', handleTestAPI)

module.exports = router
