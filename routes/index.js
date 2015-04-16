/*
 * Index page.
 */

'use strict'

var fs       = require('fs')
  , path     = require('path')
  , readline = require('readline')
  , async    = require('async')
  , router   = require('express').Router()

var util   = require('../lib/util')
  , parse    = require('../lib/parse')
  , ts       = require('../lib/timestamp')
  , sort     = require('../lib/sort')

var defaultSortingKeys = ['subarch', 'os', 'cc', 'comment', 'slot']
  , defaultSortingFn   = sort.byKeys(defaultSortingKeys)

function checkQuery (check, src) {
  if (!src) return false
  var keys = Object.keys(check)
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    if (check[key] !== src[key]) return false
  }
  return true
}

function handleIndex (req, res, next) {
  res.set('Cache-Control', 'public, max-age=60') // one minute
  // Always contain the short branch name (e.g. v2.4).
  var branch = res.locals.branch = req.params.branch || 'master'
  // TODO
  var check = checkQuery.bind(null, {
            // no special treatment for master should be needed
    branch: branch.replace(/^v([0-9])/, 'release/$1')
  })

  fs.readdir(util.dir, function handleSlots (err, slots) {
    if (err) {
      err.message = 'util.dir not found. Did you set up config.js'
                  + 'correctly?'
      err.message = 'FATE data not found.'
      err.status = 404
      return next(err)
    }

    fs.readFile(path.join(util.dir, 'branches'), 'utf8',
                function (err, data) {
      if (err) {
        res.locals.branches = ['master']
      } else {
        // readline? nah.
        var branches = data
                         .split('\n')
                         .filter(function (b) { return b })
                         .sort()
                         .reverse()
        branches.unshift('master')
        res.locals.branches = branches
      }
      
      if (res.locals.branches.indexOf(branch) === -1) {
        err = new Error('Branch not found')
        err.status = 404
        return next(err)
      }

      // For every slot get the summary of the latest results.
      async.map(slots, function iterator (slot, out) {
        var slotdir = path.join(util.dir, slot)

        // If the slot is marked as hidden then skip over it.
        // All the null members of the array will be cleaned at
        // the end().
        fs.exists(path.join(slotdir, 'hidden'), function (exists) {
          if (exists) return out(null, null)
          // Load summary
          parse.loadSummary(slot, 'latest',
                            function summaryCb (err, summary) {
            // Ignore possible errors in one specific report in order
            // not to destroy the entire history page.
            if (err || !check(summary)) return out(null, null)
            
            parse.loadSummary(slot, 'previous', function prevCb (err, prev) {
              if (err || !prev) return out(null, [ summary ])
              out(null, [ summary, prev ])
            })
          })
        })
      }, function end (err, reps) {
        // The server side sorting is only for default sorting.
        // Client-side sorting through FooTable handles
        // everything else.
        // XXX: should we implement CGI-style server-side sorting too?
        res.locals.reps =
          reps
            .filter(function (n) {
              // Filter out null/invalid ones
              // Also hack to make broken results invisible
              return n != null && n[0].os
            })
            .sort(function (a, b) {
              return defaultSortingFn(a[0], b[0]) 
            })
        res.render('index.ejs')
      })
    })
  })
}

router.get('/', handleIndex)
router.get('/index.cgi', handleIndex)
router.get('/:branch', handleIndex)

module.exports = router
