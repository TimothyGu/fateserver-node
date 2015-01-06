/* Can't use $.toggle() as we are using a custom `display` that is `none`
   when the page first loads */
function toggle (name, mode) {
  var id = name + '-' + mode
  var e = document.getElementById(id)
  var ej = $(e)
  e.style.display = e.style.display == 'table-row' ? 'none' : 'table-row'
  $('#' + id + '-btn').toggleClass('active')
  if (e.style.display === 'table-row') {
    if (ej.hasClass('loaded')) return
    $.getJSON('/api/' + slot + '/' + date + '/' + name, null,
              function success (data) {
      ej.find('code.language-git').html(
        decodeURIComponent(escape(atob(data[mode]))))
      ej.addClass('loaded')
      Prism.highlightAll() // FIXME
    })
  }
}
function hide (id) {
  var e = document.getElementById(id)
  e.style.display = 'none'
  $('#' + id + '-btn').removeClass('active')
}
function show_diff (name) {
  hide(name + '-stderr')
  toggle(name, 'diff')
}
function show_err (name) {
  hide(name + '-diff')
  toggle(name, 'stderr')
}
