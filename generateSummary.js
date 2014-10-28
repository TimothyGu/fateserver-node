#!/usr/bin/env node
/*
 * summary.json generator.
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

/*
 * Prints JSON summary to stdout.
 * Usage: generateSummary <report> <nwarn>
 */

var fs = require('fs')
var readline = require('readline')
var path = require('path')

var fate = require('./lib/parse')

function generateSummary(reportFile, nwarn) {
    var header = null, config = null
    var stats = {
        ntests: 0,
        npass : 0,
        nfail : 0,
        nwarn : nwarn
    }

    var reportD = fs.createReadStream(reportFile)

    var lr = new readline.createInterface({
        input: reportD,
        terminal: false
    })

    lr.on('line', function(line) {
        switch (line.split(':')[0]) {
        case 'fate':
            if (!header)
                header = fate.splitHeader(line)
            break
        case 'config':
            if (!config)
                config = fate.splitConfig(line)
            break
        default:
            var rec = fate.splitRec(line)
            if (rec) {
                stats.ntests++
                if (rec.status == 0)
                    stats.npass++
            }
        }
    }).on('close', function() {
        stats.nfail = stats.ntests - stats.npass
        if (stats.npass) {
            stats.rclass = stats.nfail ? 'warn' : 'pass'
            stats.rtext  = stats.npass + ' / ' + stats.ntests
        } else if (!stats.ntests && !header.status) {
            stats.rclass = 'pass'
            stats.rtext  = 'build only'
        } else {
            stats.rclass = 'fail'
            stats.rtext  = header.errstr
        }
        console.log(JSON.stringify({
                'h': header,
                'c': config,
                's': stats
        }))
    })
}

var reportFile = process.argv[2]
var nwarn = process.argv[3]

generateSummary(reportFile, nwarn)
