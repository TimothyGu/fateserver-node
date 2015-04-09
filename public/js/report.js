var initWidth = false

/* Can't use $.toggle() as we are using a custom `display` that is `none`
   when the page first loads */
function toggle (name, mode) {
  var id = name.replace(/\./g, '\\.') + '-' + mode
    , e = $('#' + id)
    , activating = e.css('display') === 'none'
  e.css('display', activating ? 'table-row' : 'none')
  $('#' + id + '-btn').toggleClass('active')
  if (activating) {
    if (e.hasClass('loaded')) return
    $.getJSON('/api/' + slot + '/' + date + '/' + name, null,
              function success (data) {
      var codeElement = e.find('code.language-git')
      codeElement.html(decodeURIComponent(escape(atob(data[mode]))))
      e.addClass('loaded')
      Prism.highlightElement(codeElement[0])
    })
  }
  // This hack needed because we are embedding a <pre> into a <td>, and
  // `width: 100%` refers to the width of the <pre> text rather than the parent
  // width.
  // `setTimeout` used to get the REAL width as the browser might adjust the
  // width of the parent <div> after this function is called.
  if (!init) {
    setTimeout(function () {
      adjustWidth()
      init = true
    }, 100)
  }
}
// Timeout object used to debounce resize events
var resized;
$(window).on('resize', function(){
  if (!init) return
  clearTimeout(resized)
  resized = setTimeout(adjustWidth, 400)
})

function adjustWidth () {
  // 8 is the padding
  var width = $('#failed_tests').width() - 8 * 2 + 'px'
  var pre = document.getElementsByTagName('pre')
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
