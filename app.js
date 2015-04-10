/*
 * The main routines.
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

var express = require('express')
  , fs      = require('fs')
  , path    = require('path')
  , morgan  = require('morgan')
  , compression = require('compression')

try {
  var memwatch = require('memwatch')
  memwatch.on('leak', console.warn)
} catch (ex) {
  // ignored
}

try {
  var toobusy = require('toobusy')
} catch (ex) {}

var index   = require('./routes/index')
  , history = require('./routes/history')
  , report  = require('./routes/report')
  , log     = require('./routes/log')
  , api     = require('./routes/api')

var ts      = require('./lib/timestamp')
  , util    = require('./lib/util')

var app = express()
if (util.proxy) app.enable('trust proxy')

// VIEW ENGINE SETUP
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.engine('ejs', require('ejs-tj').__express)

// EJS LOCALS
app.locals.ts     = ts
app.locals.moment = require('moment')
app.locals.util   = util

app.use(function (req, res, next) {
  if (toobusy && toobusy()) {
    res.status(503).send("Server too busy. Please try again later.")
  } else {
    next()
  }
})

app.use(morgan('short'))
if (app.get('env') === 'production') {
  app.use(morgan('combined', {
    stream: fs.createWriteStream(util.log, { flags: 'a' })
  }))
}

// ROUTING
app.use(log)

// Intentioanlly move log before auto-compression because we deal with it
// differently.
app.use(compression({threshold: '1kb'}))

app.use(api)
app.use(history)
app.use(report)
app.use(index)
app.use(express.static(path.join(__dirname, 'public')))

// ERROR HANDLING

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    var status = err.status || 500
    res.status(status)
    res.render('error', {
      message: err.message
    , error: err
    , status: status
    , _with: false
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  var status = err.status || 500
  res.status(status)
  if (err.json) {
    var newErr = {
      status: err.status
    , message: err.message
    }
    res.json(newErr)
  } else {
    res.render('error', {
      message: err.HTMLMessage || err.message
    , error: null
    , status: status
    , _with: false
    })
  }
})

module.exports = app
