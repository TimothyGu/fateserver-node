/*
 * Log page.
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
  , router   = require('express').Router()
  , zlib     = require('zlib')

var util     = require('../lib/util')
  , parse    = require('../lib/parse')

function handleLog (slot, date, log, req, res, next) {
  var logFile = path.join(slot, date, log + '.log.gz')
  var logPath = path.join(util.dir, logFile)
  res.setHeader('Cache-Control', 'public, max-age=31536000') // a year

  fs.readFile(logPath, function handleLogFile (err, data) {
    if (err) {
      err.HTMLMessage = 'Log "' + logFile + '" not found.'
      err.status = 404
      return next(err)
    }

    res.set('Content-Type', 'text/plain')
    var acceptedEncoding = req.get('Accept-Encoding')
    if (acceptedEncoding && acceptedEncoding.match(/gzip/)) {
      // If gzip is accepted as a Content-Encoding, send the .gz directly
      res.set('Content-Encoding', 'gzip')
      return res.send(data)
    } else {
      // Otherwise, decompress it and then send it
      zlib.gunzip(data, function unzipCb (err, data) {
        if (err) {
          err.status = 500
          next(err)
        }
        res.send(data)
      })
    }
  })
}

router.get('/log/:slot/:time/:log', function (req, res, next) {
  handleLog(req.params.slot, req.params.time, req.params.log, req, res, next)
})
router.get('/log.cgi', function (req, res, next) {
  handleLog(req.query.slot, req.query.time, req.query.log, req, res, next)
})
module.exports = router
