/*
 * The main routines.
 */

'use strict'

var express = require('express')
  , fs      = require('fs')
  , path    = require('path')
  , morgan  = require('morgan')
  , compression = require('compression')
  , ejs     = require('ejs-tj')

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
app.engine('ejs', ejs.__express)

// EJS LOCALS
app.locals.ts     = ts
app.locals.moment = require('moment')
app.locals.util   = util
app.locals._with  = false
ejs.localsName = 'l'

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
if (!util.proxy) app.use(compression({threshold: '1kb'}))

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
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  var status = err.status || 500
  if (status === 404) {
    res.set('Cache-Control', 'public, max-age=2592000') // one month
  } else {
    res.set('Cache-Control', 'public, max-age=60') // one minute
  }
  res.status(status)
  if (err.json) {
    var newErr = {
      status: err.status
    , message: err.message
    }
    res.json(newErr)
  } else if (err.textOnly) {
    res.send(err.message)
  } else {
    res.render('error', {
      message: err.message
    , error: null
    , status: status
    })
  }
})

// Error handler for errors in the error handler(s)
app.use(function (err, req, res, next) {
  // Hopefully I'll fix this quick enough
  res.set('Cache-Control', 'public, max-age=60')
  res.status(500).send('Something’s horribly broken. File a ticket please.')
})

module.exports = app
