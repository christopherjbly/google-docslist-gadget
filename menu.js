function DocumentMenu(mainDiv) {
  this.onSelected = null;

  this.mainDiv = mainDiv;
  this.list = child(this.mainDiv, 'newDocumentOptions');

  this.formItem = child(this.list, 'newDocumentForm');
  this.presentationItem = child(this.list, 'newDocumentPresentation');
  this.spreadsheetItem = child(this.list, 'newDocumentSpreadsheet');
  this.documentItem = child(this.list, 'newDocumentDocument');

  this.formItem.onclick = this.newDocument.bind(this,
      Document.FORM);
  this.presentationItem.onclick = this.newDocument.bind(this,
      Document.PRESENTATION);
  this.spreadsheetItem.onclick = this.newDocument.bind(this,
      Document.SPREADSHEET);
  this.documentItem.onclick = this.newDocument.bind(this,
      Document.DOCUMENT);
}

DocumentMenu.prototype.isOpen = function() {
  return this.mainDiv.visible;
};

DocumentMenu.prototype.toggle = function() {
  if (this.isOpen()) {
    this.close();
  } else {
    this.open();
  }
};

DocumentMenu.prototype.open = function() {
  this.mainDiv.visible = true;
};

DocumentMenu.prototype.close = function() {
  this.mainDiv.visible = false;
};

DocumentMenu.prototype.newDocument = function(type) {
  this.close();

  if (this.onSelected) {
    this.onSelected(type);
  }
};
