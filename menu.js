function DocumentMenu() {
  this.isOpen = false;

  commandsNew.onclick = this.open.bind(this);
  commandsNewArrow.onclick = this.open.bind(this);

  window.onclick = this.close.bind(this);

  newDocumentForm.onclick = this.newDocument.bind(this);
  newDocumentPresentation.onclick = this.newDocument.bind(this);
  newDocumentSpreadsheet.onclick = this.newDocument.bind(this);
  newDocumentDocument.onclick = this.newDocument.bind(this);
}

DocumentMenu.prototype.open = function() {
  this.isOpen = true;
  newDocument.visible = true;
};

DocumentMenu.prototype.close = function() {
  if (!this.isOpen) {
    return;
  }
  this.isOpen = false;
  newDocument.visible = false;
};

DocumentMenu.prototype.newDocument = function() {
  this.close();
  if (!framework.system.network.online) {
    errorMessage.display(strings.ERROR_SERVER_OR_NETWORK);
    return;
  }
  if (NEW_DOC[event.srcElement.name]) {
    framework.openUrl(NEW_DOC[event.srcElement.name]);
  }
};

var newDocumentMenu = new DocumentMenu();
