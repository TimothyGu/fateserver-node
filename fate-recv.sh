#! /bin/sh
#
# Copyright (c) 2011 Mans Rullgard <mans@mansr.com>
#
# Permission to use, copy, modify, and distribute this software for any
# purpose with or without fee is hereby granted, provided that the above
# copyright notice and this permission notice appear in all copies.
#
# THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHORS DISCLAIM ALL WARRANTIES
# WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
# MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR
# ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
# WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
# ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
# OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

set -e
export LC_ALL=C

die(){
    echo "$@"
    exit 1
}

test -n "$FATEDIR" || die "FATEDIR not set"
test -n "$FATE_USER" || die "FATE_USER not set"

reptmp=$(mktemp -d)
trap 'rm -r $reptmp' EXIT
cd $reptmp

tar xzk

header=$(head -n1 report)
date=$(expr "$header" : 'fate:0:\([0-9]*\):')
slot=$(expr "$header" : 'fate:0:[0-9]*:\([A-Za-z0-9_.-]*\):')
rev=$(expr "$header" : "fate:0:$date:$slot:\([A-Za-z0-9_.-]*\):")

test -n "$date" && test -n "$slot" || die "Invalid report header"

slotdir=$FATEDIR/$slot

if [ -d "$slotdir" ]; then
    echo "$FATE_USER" >"$slotdir/owner"
    owner=$(cat "$slotdir/owner")
    test "$owner" = "$FATE_USER" || die "Slot $slot owned by somebody else"
else
    mkdir "$slotdir"
    echo "$FATE_USER" >"$slotdir/owner"
fi

exec <report

ntest=0
npass=0
IFS=:

exec >pass
while read name status rest; do
    if [ "$status" = 0 ]; then
        echo "$name:$date:$rev"
        npass=$(($npass+1))
    fi
    ntest=$(($ntest+1))
done
exec <&- >&-

upass(){
    read pname pdate prev || return 0
    # Because we `sort`ed the input before passing it to upass, same tests
    # always in couplets in the order of new to old.
    while read lname ldate lrev; do
        # If the second line describes the same test, discard it because it's
        # the old result.
        test "$lname" != "$pname" && echo "$pname:$pdate:$prev"
        pname=$lname
        pdate=$ldate
        prev=$lrev
    done
    echo "$pname:$pdate:$prev"
}

lastpass=$slotdir/lastpass

if [ -r $lastpass ]; then
    sort pass $lastpass | upass >lastpass
else
    sort -o lastpass pass
fi

unset IFS

nwarn=$(grep -Eci '\<warning\>' compile.log) || nwarn=0

`dirname $0`/generateSummary.js report $nwarn > summary.json

repdir=$slotdir/$date
mkdir $repdir
gzip -9 *.log
xz -0 report
cp -p summary.json report.xz *.log.gz $repdir
chmod 644 $repdir/*
rm -f $slotdir/previous
test -e $slotdir/latest && mv $slotdir/latest $slotdir/previous
ln -s $date $slotdir/latest
cp lastpass ${lastpass}.new && mv ${lastpass}.new $lastpass
