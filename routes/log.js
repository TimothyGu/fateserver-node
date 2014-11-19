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

var fs       = require('fs'),
    path     = require('path'),
    debug    = require('debug')('r:log')

var config   = require('../lib/config')
  , parse    = require('../lib/parse')

function handleLog(slot, date, log, req, res, next) {
    var logFile = path.join(slot, date, log + '.log.gz')
    var logPath = path.join(config.dir, logFile)
    debug('logPath: ' + logPath)

    fs.readFile(logPath, function(err, data) {
        if (err) {
            var newErr = new Error('Log "' + logFile + '" not found.')
            newErr.status = 404
            // Use old stack trace
            newErr.stack = err.stack
            return next(newErr)
        }

        res.set('Content-Type', 'text/plain')
        var acceptedEncoding = req.get('Accept-Encoding')
        if (acceptedEncoding && acceptedEncoding.match(/gzip/)) {
            res.set('Content-Encoding', 'gzip')
            return res.send(data)
        } else {
            var zlib = require('zlib')
            debug('non-gzip')
            zlib.gunzip(data, function(err, data) {
                if (err) {
                    err.status = 500
                    next(err)
                }
                res.send(data)
            })
        }
    })
}

module.exports = handleLog
