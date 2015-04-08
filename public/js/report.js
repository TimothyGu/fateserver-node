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
