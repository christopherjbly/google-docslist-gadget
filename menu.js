function DocumentMenu(mainDiv) {
  this.mainDiv = mainDiv;
  this.onSelected = null;
  this.list = child(this.mainDiv, 'newDocumentOptions');

  this.formItem = child(this.list, 'newDocumentForm');
  this.presentationItem = child(this.list, 'newDocumentPresentation');
  this.spreadsheetItem = child(this.list, 'newDocumentSpreadsheet');
  this.documentItem = child(this.list, 'newDocumentDocument');

  this.formItem.onclick = this.newDocument.bind(this);
  this.presentationItem.onclick = this.newDocument.bind(this);
  this.spreadsheetItem.onclick = this.newDocument.bind(this);
  this.documentItem.onclick = this.newDocument.bind(this);
}

DocumentMenu.prototype.isOpen = function() {
  return this.mainDiv.visible;
};

DocumentMenu.prototype.open = function() {
  this.mainDiv.visible = true;
};

DocumentMenu.prototype.close = function() {
  this.mainDiv.visible = false;
};

DocumentMenu.prototype.newDocument = function() {
  this.close();

  if (this.onSelected) {
    this.onSelected(event.srcElement.name);
  }
};
