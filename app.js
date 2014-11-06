/*
 * The main routines.
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

var express = require('express')
var path    = require('path')
var debug   = require('debug')('app')
var logger  = require('morgan')
var compression = require('compression')

//var index = require('./routes/index')
var history = require('./routes/history')
var report  = require('./routes/report')
var log     = require('./routes/log')

var ts      = require('./lib/timestamp')
var config  = require('./lib/config')

'use strict'

var app = express()
app.set('env', config.env)

// VIEW ENGINE SETUP
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

if (app.get('env') !== 'development') {
    app.enable('view cache')
}
/*
app.use(function(req, res, next) {
    debug(req.headers)
    next()
})
*/

// EJS LOCALS
app.locals.ts     = ts
app.locals.moment = require('moment')
app.locals.config = config
app.locals.util   = require('./lib/ejs-util.js')

app.use(logger('short'))

// ROUTING
app.get('/log/:slot/:time/:log', function(req, res, next) {
    log(req.params.slot, req.params.time, req.params.log, req, res, next)
})
app.get('/log.cgi', function(req, res, next) {
    log(req.query.slot, req.query.time, req.query.log, req, res, next)
})

// Intentioanlly move log before auto-compression because we deal with it
// differently.
app.use(compression({ threshold: '1kb' }))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/history/:slot', function(req, res, next) {
    history(req.params.slot, req.query.begin || 0, res, next)
})
app.get('/history.cgi', function(req, res, next) {
    history(req.query.slot, req.query.begin || 0, res, next)
})

app.get('/report/:slot/:time', function(req, res, next) {
    report(req.params.slot, req.params.time, res, next)
})
app.get('/report.cgi', function(req, res, next) {
    report(req.query.slot, req.query.time, res, next)
})

// ERROR HANDLING

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
})

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        var status = err.status || 500
        res.status(status)
        res.render('error', {
            message: err.message,
            error: err,
            status: status,
            _with: false
        })
    })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    var status = err.status || 500
    res.status(status)
    debug('msg: ' + err.message)
    res.render('error', {
        message: err.HTMLMessage || err.message,
        error: null,
        status: status,
        _with: false
    })
})

module.exports = app
