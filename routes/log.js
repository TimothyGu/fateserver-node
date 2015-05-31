/*
 * Log page.
 */

'use strict'

var fs       = require('fs')
  , join     = require('path')
  , router   = require('express').Router()
  , zlib     = require('zlib')

var util     = require('../lib/util')
  , parse    = require('../lib/parse')

function handleLog (slot, date, log, req, res, next) {
  var logFile = join(slot, date, log + '.log.gz')
  var logPath = join(util.dir, logFile)
  res.set('Cache-Control', 'public, max-age=31536000') // a year

  fs.readFile(logPath, function handleLogFile (err, data) {
    if (err) {
      err.message = 'Log "' + logFile + '" not found.'
      err.status = 404
      err.textOnly = true
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
