import zipfile

PACKAGE_FILENAME = 'google-docslist-gadget.gg'

FILES = [
  'auth.js',
  'date.js',
  'docs_feed.js',
  'docs_ui.js',
  'document.js',
  'errorMessage.js',
  'gadget.gmanifest',
  'httpRequest.js',
  'icon_large.png',
  'icon_small.png',
  'login_ui.js',
  'main.js',
  'main.xml',
  'menu.js',
  'online_checker.js',
  'scrollbar.js',
  'search.js',
  'sort.js',
  'upload_file.js',
  'upload_ui.js',
  'upgrade_ui.js',
  'util.js',
  'version_checker.js',
  'en/strings.xml',
  'images/action_default.png',
  'images/action_down.png',
  'images/action_hover.png',
  'images/active-bg.gif',
  'images/base_bottom.png',
  'images/base_bottomleft.png',
  'images/base_bottomright.png',
  'images/base_fill.png',
  'images/base_left.png',
  'images/base_right.png',
  'images/base_top.png',
  'images/base_topleft.png',
  'images/base_topright.png',
  'images/blue-area-fill.gif',
  'images/blue-area-left.gif',
  'images/blue-area-right.gif',
  'images/checkbox_checked.png',
  'images/checkbox_default.png',
  'images/checkbox_focus.png',
  'images/date-name-arrow.gif',
  'images/date-name-divider.gif',
  'images/down-arrow.gif',
  'images/dropdown-bottom-left.png',
  'images/dropdown-bottom-right.png',
  'images/dropdown-bottom.png',
  'images/dropdown-left.png',
  'images/dropdown-right.png',
  'images/dropdown-top-left.png',
  'images/dropdown-top-right.png',
  'images/dropdown-top.png',
  'images/dropshadow-bottom.gif',
  'images/dropshadow-left-bottom.gif',
  'images/dropshadow-right-bottom.gif',
  'images/dropshadow-right.gif',
  'images/error_center.png',
  'images/error_left.png',
  'images/error_right.png',
  'images/google_logo.png',
  'images/icon-all.gif',
  'images/icon-check.gif',
  'images/icon-document.gif',
  'images/icon-form.gif',
  'images/icon-pad.gif',
  'images/icon-presentation.gif',
  'images/icon-spreadsheet.gif',
  'images/icon-star.gif',
  'images/icon-star-big.gif',
  'images/icon-upload-error.gif',
  'images/icon-upload-loading.gif',
  'images/icon-upload-success.gif',
  'images/inactive-bg.gif',
  'images/logo.png',
  'images/name-date-arrow.gif',
  'images/name-date-divider.gif',
  'images/scroll-bar.gif',
  'images/scroll-down.gif',
  'images/scroll-track.gif',
  'images/scroll-up.gif',
  'images/textbox-close.gif',
]

package = zipfile.ZipFile(PACKAGE_FILENAME, 'w',
    compression=zipfile.ZIP_DEFLATED)
for file in FILES:
  print file
  package.write(file)
package.close()

print
print PACKAGE_FILENAME
