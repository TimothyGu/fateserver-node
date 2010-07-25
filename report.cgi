#! /usr/bin/perl

use strict;
use warnings;

use CGI qw/param/;
use HTML::Entities;
use MIME::Base64;
use FATE;

our $fatedir;
require "$ENV{FATEWEB_CONFIG}";

my $req_slot = param 'slot';
my $req_time = param 'time';

my $repdir = "$fatedir/$req_slot/$req_time";
my $report = "$repdir/report";

open R, $report or fail 'Requsted report not found';

my @header = split /:/, scalar <R>;
$header[0] eq 'fate' or die "Bad magic";
$header[1] eq '0'    or die "Bad report version";
my ($date, $slot, $rev, $err, $errstr) = @header[2..6];

my @config = split /:/, scalar <R>;
my ($arch, $subarch, $cpu, $os, $cc, $config) = @config[1..6];
if ($config[0] ne 'config') {
    print "Error in report: exptected 'config', found '$config[0]'\n";
    exit 1;
}

my @recs;
my %pass;
my %fail;

while (<R>) {
    my @rec = split /:/;
    ${$rec[1]? \%fail: \%pass}{$rec[0]} = \@rec;
}

close R;

my $npass = keys %pass;
my $nfail = keys %fail;
my $ntest = $npass + $nfail;

# main text

print "Content-type: text/html\r\n\r\n";

doctype;
start 'html', xmlns => "http://www.w3.org/1999/xhtml";
start 'head';
tag 'meta', 'http-equiv' => "Content-Type",
            'content'    => "text/html; charset=utf-8";
tag 'link', rel  => 'stylesheet',
            type => 'text/css',
            href => 'fate.css';
print "<title>FATE: $slot $rev</title>\n";
print <<EOF;
<script type="text/javascript">
  function toggle(id) {
      var e = document.getElementById(id);
      e.style.display = e.style.display == 'table-row' ? 'none' : 'table-row';
  }
  function hide(id) {
      var e = document.getElementById(id);
      e.style.display = 'none';
  }
  function show_diff(name) {
      hide(name + '-err');
      toggle(name + '-diff');
  }
  function show_err(name) {
      hide(name + '-diff');
      toggle(name + '-err');
  }
</script>
EOF
end 'head';

start 'body';
h1 "$slot $rev", id => 'title';

start 'table', id => 'config';
trow 'Architecture',  $arch;
trow 'Variant',       $subarch;
trow 'CPU',           $cpu;
trow 'OS',            $os;
trow 'Compiler',      $cc;
trow 'Configuration', $config;
trow 'Revision',      $rev;
trow 'Date',          $date;
trow 'Status',        $err? $errstr : "$npass / $ntest";
end;

start 'table', id => 'tests';
if ($nfail) {
    start 'tr'; th "$nfail failed tests", colspan => 3; end 'tr';
    for my $n (sort keys %fail) {
        my $rec = $fail{$n};
        my $test = $$rec[0];
        my $diff = encode_entities decode_base64($$rec[2]), '<>&"';
        my $err  = encode_entities decode_base64($$rec[3]), '<>&"';
        start 'tr', class => 'fail';
        td "diff",    class => 'toggle', onclick => "show_diff('$test')";
        td "stderr",  class => 'toggle', onclick => "show_err('$test')";
        td $test;
        end 'tr';
        start 'tr', id => "$test-diff", class => 'diff';
        td $diff, colspan => 3;
        end 'tr';
        start 'tr', id => "$test-err",  class => 'diff';
        td $err,  colspan => 3;
        end 'tr';
    }
} else {
    trowa { class => 'pass' }, 'All tests successful';
}
end 'table';

end 'body';
end 'html';
