/**
 * Do upload
 */
Uploader.prototype._upload = function() {
  this.currentFile++;

  if (this.currentFile < this.files.length) {

    var headers = {
      'Content-Type': this.files[this.currentFile].mime,
      'Slug': this.files[this.currentFile].title
    };

    view.setTimeout(function() {
      httpRequest.connect(this.files[this.currentFile].filename, this.uploadSuccess.bind(this), this.uploadError.bind(this), headers, true);
    }.bind(this), 2000); // needs the delay otherwise consecutive files sometimes return 400 error
    return;
  }
}
