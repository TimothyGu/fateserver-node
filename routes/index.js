/*
 * Index page.
 */

'use strict'

var fs       = require('fs')
  , join     = require('path').join
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
  if (req.params.branch === 'master') return res.redirect(301, '/')
  // Always contain the branch name like n2.4
  var branch = res.locals.branch = req.params.branch || 'master'
  // TODO
  // var check = checkQuery.bind(null, {
  //   branch: branch
  // })

  fs.readdir(util.dir, function handleSlots (err, slots) {
    if (err) {
      err.message = 'util.dir not found. Did you set up config.js'
                  + 'correctly?'
      err.message = 'FATE data not found.'
      err.status = 404
      return next(err)
    }

    fs.readFile(join(util.dir, 'branches'), 'utf8',
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

      var match = branch.match(/^v([0-9]\.[0-9])$/)
      var re
      if (match) {
        // If the branch is a release branch, filter slot names
        re = RegExp('-n' + match[1] + '$')
        slots = slots.filter(function (s) { return re.test(s) })
      } else if (branch === 'master') {
        // If not, filter out all release branches
        re = /-n[0-9]\.[0-9]$/
        slots = slots.filter(function (s) { return !re.test(s) })
      } else {
        // If it is not a branch at all
        err = new Error('Need to update branch list. Please file a bug report.')
        err.status = 500
        return next(err)
      }

      // For every slot get the summary of the latest results.
      async.map(slots, function iterator (slot, out) {
        var slotdir = join(util.dir, slot)

        // If the slot is marked as hidden then skip over it.
        // All the null members of the array will be cleaned at
        // the end().
        fs.exists(join(slotdir, 'hidden'), function (exists) {
          if (exists) return out(null, null)
          // Load summary
          parse.loadSummary(slot, 'latest',
                            function summaryCb (err, summary) {
            // Ignore possible errors in one specific report in order
            // not to destroy the entire history page.
            if (err) return out(null, null)
            
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
