/*!
 * Copyright © 2014-2015 Tiancheng “Timothy” Gu
 * Licensed under the MIT License
 */

var toggledAtLeastOnce = false

/* Can't use $.toggle() as we are using a custom `display` that is `none`
   when the page first loads */
function toggle (name, mode) {
  var id = name.replace(/\./g, '\\.') + '-' + mode
    , e = $('#' + id)
    , activating = e.css('display') === 'none'
  e.css('display', activating ? 'table-row' : 'none')
  $('#' + id + '-btn').toggleClass('active')
  if (activating) {
    if (e.hasClass('loaded')) return adjustWidth()
    $.getJSON('/api/' + slot + '/' + date + '/' + name, null,
              function success (data) {
      var codeElement = e.find('code.language-git')
      codeElement.html(decodeURIComponent(escape(atob(data[mode]))))
      e.addClass('loaded')
      Prism.highlightElement(codeElement[0])
      // This hack needed because we are embedding a <pre> into a <td>, and
      // `width: 100%` refers to the width of the <pre> text rather than the parent
      // width.
      adjustWidth()
      toggledAtLeastOnce = true
    })
  }
}

var resized;
var handlerAttached = false
$(window).on('resize', function(){
  if (!toggledAtLeastOnce) return
  clearTimeout(resized)
  resized = setTimeout(function () {
    var container = document.getElementById('failed_tests')
    if (container.scrollWidth > 0) return adjustWidth()

    if (handlerAttached) return
    handlerAttached = true
    var tabs = $('a[data-toggle="tab"]')
    return tabs.on('shown.bs.tab', function handler (e) {
      if (e.target.href.split('#')[1] === container.id) {
        setTimeout(adjustWidth, 100)
        handlerAttached = false
        tabs.off('shown.bs.tab', handler)
      }
    })
  }, 400)
})

function adjustWidth () {
  // 8 is the padding
  var width = $('#failed_tests').width() - 8 * 2 + 'px'
  var pre = document.getElementsByClassName('line-numbers')
  for (var i = 0; i < pre.length; i++) {
    pre[i].style.width = width
  }
}

function hide (id) {
  var e = document.getElementById(id)
  e.style.display = 'none'
  $('#' + id.replace(/\./g, '\\.') + '-btn').removeClass('active')
}
function show_diff (name) {
  hide(name + '-stderr')
  toggle(name, 'diff')
}
function show_err (name) {
  hide(name + '-diff')
  toggle(name, 'stderr')
}

(function (w) {
  function getId (str) {
    return str.substring(str.indexOf('#') + 1)
  }

  // if an id is specified in the URL respect it
  function showById () {
    var id = getId(w.location.hash) || 'info'
    $('a[href="#' + id + '"]').tab('show')
  }

  $(showById)
  w.addEventListener('popstate', showById)

  // if a tab is activated update the URL accordingly
  // can't use show.bs.tab here as we don't want to push another state when
  // the user clicks back.
  $('#reportTab a[role="tab"]').on('click', function () {
    var urlWithoutHash = w.location.origin + w.location.pathname
    var id = getId(this.href)
    var current = getId(w.location.hash)

    // noop if the action is useless
    if (current === id || !current && id === 'info') return

    w.history.pushState({}, '', urlWithoutHash + '#' + id);
  })
})(window)
