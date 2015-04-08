/*
 * API.
 *
 * Copyright (c) 2014-2015 Tiancheng "Timothy" Gu <timothygu99@gmail.com>
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
  , readline = require('readline')
  , debug    = require('debug')('f:r:api')
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
  , summary: parse.loadSummary.bind(null, date)
  , report: parse.loadReport.bind(null, slot, date, 0)
  , lastpass: parse.loadLastPass.bind(null, slot)
  , prevDate: function (callback) {
      fs.readdir(path.join(util.dir, slot), function (err, files) {
        if (err) {
          err.json = true
          err.HTMLMessage = 'Slot "' + slot + '" not found.'
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
      debug('cache hit')
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
    debug('cache miss')
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
