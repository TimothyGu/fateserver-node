/*
 * Index page.
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
    var key = check[keys[i]]
    if (check[key] !== src[key]) return false
  }
  return true
}

function handleIndex (req, res, next) {
  var branch
  res.setHeader('Cache-Control', 'public, max-age=60') // one minute
  // req.params.branch, res.locals.branch, and res.locals.branches always
  // contain the short branch name (e.g. v2.4).
  // branch always contains the vanilla branch name.
  if (req.params.branch) {
    res.locals.branch = req.params.branch
    branch = req.params.branch.replace(/^v([0-9])/, 'release/$1')
  } else {
    branch = 'master'
    res.locals.branch = 'master'
  }
  // TODO
  var check = checkQuery.bind(null, { branch: branch })

  fs.readdir(util.dir, function handleSlots (err, slots) {
    if (err) {
      err.message = 'util.dir not found. Did you set up config.js'
                  + 'correctly?'
      err.HTMLMessage = 'FATE data not found.'
      err.status = 404
      return next(err)
    }

    async.parallel([
      function readBranches (done) {
        var branchesStream =
          fs.createReadStream(path.join(util.dir, 'branches'))
            .on('error', function() {
              res.locals.branches = ['master']
              done()
            })
        var branches = []
        var lr = new readline.createInterface({
          input: branchesStream
        , terminal: false
        })
        lr.on('line', function (l) {
            branches.push(l)
          })
          .on('close', function branchesDone () {
            // Sort the branches from newest to oldest and add master
            // to the front.
            branches = branches.sort().reverse()
            branches.unshift('master')
            res.locals.branches = branches
            done()
          })
      }
      , function readSlots (done) {
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
          done()
        })
      }
    ], function end () {
      res.render('index.ejs', { _with: false })
    })
  })
}

router.get('/', handleIndex)
router.get('/index.cgi', handleIndex)
router.get('/:branch', handleIndex)

module.exports = router
