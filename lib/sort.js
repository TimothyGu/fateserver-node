/**
 * @file Report-sorting utilities.
 * @module lib/sort
 */

'use strict'

var moment = require('moment')

// 0 = is it desc?
// 1 = vanilla key
// 2 = opposite key
module.exports.matchDesc = function (key) {
  if (!key) return null
  var match = key.match(/^desc-(.*)/)
  if (match) {
    match[2] = key
    return match
  } else {
    return [null, key, 'desc-' + key]
  }
}
var matchDesc = module.exports.matchDesc

/**
 * Callback for `Array.prototype.sort()` that sorts an Array of
 * {@link module:lib/parse.Summary}'s by a specified key.
 *
 * @param {string} sortKey Key to sort by
 * @returns {sortingCallback} Callback to be passed to Array.prototype.sort()
 *
 * @example
 * var reps = [ parse.loadSummary('my-slot',   20140101000000)
 *            , parse.loadSummary('otro-slot', 20140201010111) ]
 * // Sort `reps` by reversed chronological order
 * reps.sort(sort.by('desc-date'))
 *
 */
module.exports.by = function (sortKey) {
  if (!sortKey) {
    return function () {
      return 0
    }
  }

  // Descending sorting key are prefixed by `desc-`
  var matchedDesc = matchDesc(sortKey)
    , order

  if (matchedDesc[0]) {
    // If there is match, matchedDesc[0] will be sortKey while
    // matchedDesc[1] will be the part without `desc-`.
    order = -1
    sortKey = matchedDesc[1]
  } else {
    order = 1
  }

  return function (a, b) {
    if (a[sortKey] == b[sortKey]) {         // If they are the same ...
      return  0                             // consider them neutral.
    } else if (a[sortKey] > b[sortKey]) {
      return  1 * order
    }  else {
      return -1 * order
    }
  }
}
var by = module.exports.by

/**
 * Callback for `Array.prototype.sort()` that sorts an Array of
 * {@link module:lib/parse.Summary}'s by a number of keys.
 *
 * @param {string[]} sortKeys Key to sort by
 * @returns {sortingCallback} Callback to be passed to Array.prototype.sort()
 *
 * @example
 * var sort = require('./lib/sort')
 *
 * var reps = [
 *     parse.loadSummary('my-slot',   20140101000000)
 *   , parse.loadSummary('my-slot',   20131231235959)
 *   , parse.loadSummary('otro-slot', 20140201010111)
 * ]
 *
 * // Sort `reps` by alphabetical slot order, then chronological order if
 * // the slot names are the same.
 * reps.sort(sort.byKeys(['slot', 'date']))
 *
 * // Sort `reps` by alphabetical slot order, then descending chronological
 * // order if the slot names are the same.
 * reps.sort(sort.byKeys(['slot', 'desc-date']))
 */
module.exports.byKeys = function (sortKeys) {
  return function (a, b) {
    for (var i = 0; i < sortKeys.length; i++) {
      var res = by(sortKeys[i])(a, b)

      // If result is useful or if we are at the end of the sorting array
      if (res !== 0) return res
    }
    return 0
  }
}

