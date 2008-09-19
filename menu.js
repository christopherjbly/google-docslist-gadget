
/**
 * Constructor for DocumentMenu class.
 */
function DocumentMenu() {
  this.isOpen = false;

  commandsNew.onclick = this.open.bind(this);
  commandsNewArrow.onclick = this.open.bind(this);
  window.onclick = this.close.bind(this);
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

// instantiate object in the global scope
var newDocumentMenu = new DocumentMenu();



