/**
 * @file A light in-memory cache
 *
 * fateserver-node utilizes the lru-cache npm module for caching. See
 * https://github.com/isaacs/node-lru-cache on how to use this module.
 * Please always use .lock when accessing the cache.
 *
 * @module lib/cache
 */

var cacheCount
try {
  cacheCount = require('../config').cache || 50
} catch (ex) {
  cacheCount = 50
}

var lru = require('lru-cache')
  , ReadWriteLock = require('rwlock')

module.exports       = lru(cacheCount)
module.exports.lock  = new ReadWriteLock()
