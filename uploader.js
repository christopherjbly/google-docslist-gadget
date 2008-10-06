/**
 * Do upload
 */
Uploader.prototype._upload = function() {
  this.currentFile++;

  if (this.currentFile < this.files.length) {


    view.setTimeout(function() {
    }.bind(this), 2000); // needs the delay otherwise consecutive files sometimes return 400 error
    return;
  }
}
