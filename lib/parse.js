/*
 * Parsing.
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

/**
 * @file Parsing summary and report files.
 * @module ./lib/parse
 */

var fs = require('fs')
var readline = require('readline')
var path = require('path')

var fate_config = require('./config')

/**
 * Turns arrays of keys and values to an object.
 *
 * @param {array} keys   Array of keys
 * @param {array} values Array of values that correspond with the keys.
 * @return The resulting object
 */
function toObject(keys, values) {
    var obj = {}
    for (var i = 0; i < keys.length; i++)
        obj[keys[i]] = values[i]
    return obj
}

/**
 * Split a line into an object with objKeys, with delimiter ':'.
 *
 * If numbers is specified, the properties in the output object with the name
 * one of the member of the the numbers array will be coerced into Number
 * type.
 *
 * @param {string} line     Line to be splitted
 * @param {array}  objKeys  Keys of the line
 * @param {array} [numbers] Names of properties that are numbers
 *
 * @return the resulting object
 */

function splitLine(line, objKeys, numbers) {
    var outObj = toObject(objKeys, line.split(':'))
    if (!outObj)
        return null
    if (arguments.length === 3) {
        for (var i = 0; i < numbers.length; i++) {
            var prop = numbers[i]
            if (outObj.hasOwnProperty(prop))
                outObj[prop] = Number(outObj[prop])
            // XXX: Should we set the property to 0 as a fallback?
        }
    }
    return outObj
}

/**
 * Parses a `header` line in a report file.
 *
 * @param {string} line     Line to be splitted
 * @return The resulting object
 */
module.exports.splitHeader = function(line) {
    var objKeys = ['header', 'version', 'date', 'slot', 'rev', 'status',
                   'errstr', 'comment']
    return splitLine(line, objKeys, ['date', 'status'])
}
var splitHeader = module.exports.splitHeader

module.exports.splitConfig = function(line) {
    var objKeys = ['header', 'arch', 'subarch', 'cpu', 'os', 'cc', 'config']
    return splitLine(line, objKeys)
}
var splitConfig = module.exports.splitConfig

module.exports.splitStats = function(line) {
    var objKeys = ['header', 'ntests', 'npass', 'nwarn']
    var outObj  = splitLine(line, objKeys, ['ntests', 'npass', 'nwarn'])

    return outObj
}
var splitStats = module.exports.splitStats

function module.exports.splitRec(line) {
    var objKeys = ['name', 'status', 'diff', 'stderr']
    return splitLine(line, objKeys, ['status'])
}
splitRec = module.exports.splitRec

// Merges the header, config, and stats into a Summary object.
function Summary(h, c, s) {
    var prop
    for (prop in h) {
        if (prop !== 'header')
            if (h.hasOwnProperty(prop))
                this[prop] = h[prop]
    }
    for (prop in c) {
        if (prop !== 'header')
            if (c.hasOwnProperty(prop))
                this[prop] = c[prop]
    }
    for (prop in s) {
        if (prop !== 'header')
            if (s.hasOwnProperty(prop))
                this[prop] = s[prop]
    }
}

// Adds additional properties.
Summary.prototype.addAddlProps = function() {
    // Add nfail convenience property
    this.nfail = this.ntests - this.npass

    // Add rclass and rtext
    if (this.npass) {
        this.rclass = this.nfail ? 'warn' : 'pass'
        this.rtext  = this.npass + ' / ' + this.ntests
    } else if (!this.ntests && !this.status) {
        this.rclass = 'pass'
        this.rtext  = 'build only'
    } else {
        this.rclass = 'fail'
        this.rtext  = this.errstr
    }

    return this
}

module.exports.Summary = Summary

function loadSummaryFile(slot, date, callback) {
    var header = null, config = null, stats = null
    var repdir = path.join(fate_config.dir, slot, date)

    fs.exists(path.join(repdir, 'summary'), function(exists) {
        if (exists) {
            var summary = fs.createReadStream(path.join(repdir, 'summary'))

            var lr = new readline.createInterface({
                input: summary,
                terminal: false
            })

            lr.on('line', function(line) {
                switch (line.split(':')[0]) {
                case 'fate':
                    if (!header)
                        header = splitHeader(line)
                    break
                case 'config':
                    if (!config)
                        config = splitConfig(line)
                    break
                case 'stats':
                    if (!stats)
                        stats = splitStats(line)
                    break
                }
            }).on('close', function() {
                callback(
                    new Summary(header, config, stats).addAddlProps()
                )
            })
        }
    })
}

function loadSummary(slot, date, callback) {
    var repdir = path.join(fate_config.dir, slot, date)
    fs.exists(path.join(repdir, 'summary.json'), function(exists) {
        if (exists) {
            callback(require(path.join(repdir, 'summary.json')))
        } else {
            loadSummaryFile(slot, date, callback)
        }
    })
}
module.exports.loadSummary = loadSummary
