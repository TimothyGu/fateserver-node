/**
 * @file A light in-memory cache
 *
 * fateserver-node utilizes the lru-cache npm module for caching. See
 * https://github.com/isaacs/node-lru-cache on how to use this module.
 * Please always use .lock when accessing the cache.
 *
 * @todo Use a better mechanism like redis etc.
 *
 * @module lib/cache
 */

var cacheCount = require('./util').cache

var lru = require('lru-cache')
  , ReadWriteLock = require('rwlock')

module.exports       = lru(cacheCount)
module.exports.lock  = new ReadWriteLock()
