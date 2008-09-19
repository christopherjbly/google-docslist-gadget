
/**
 * Constructor for DocumentMenu class.
 */
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

/**
 * Open document menu
 */
DocumentMenu.prototype.open = function() {
  this.isOpen = true;
  newDocument.visible = true;
}

/**
 * Close document menu
 */
DocumentMenu.prototype.close = function() {
  if (!this.isOpen) return;
  this.isOpen = false;
  newDocument.visible = false;
}

/**
 * Launch new document
 */
DocumentMenu.prototype.newDocument = function() {
  newDocumentMenu.close();
  if (!framework.system.network.online) {
    errorMessage.display(SERVER_OR_NETWORK_ERROR);
    return;
  }
  if (NEW_DOC[event.srcElement.name]) {
    framework.openUrl(NEW_DOC[event.srcElement.name]);
  }
};

// instantiate object in the global scope
var newDocumentMenu = new DocumentMenu();



