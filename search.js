/**
 * Constructor for SearchField class.
 */
function SearchField() {
  this.active = false;
  this.defaultValue = search.value;
  this.defaultColor = search.color;

  search.onfocusin = this.activate.bind(this);
  search.onclick = this.activate.bind(this);

  search.onfocusout = this.blur.bind(this);
  search.onchange = this.autofill.bind(this);
  search.onkeydown = this.keydown.bind(this);

  searchClear.onclick = this.reset.bind(this);
}

/**
 * Draw autofill
 */
SearchField.prototype.draw = function() {
  autoFill.width = searchArea.width + (autoFillTopRight.width + 1);
  autoFillTopCenter.width = autoFill.width - (autoFillTopLeft.width + autoFillTopRight.width);
  autoFillOptions.width = autoFillTopCenter.width;
  autoFillBottomCenter.width = autoFillTopCenter.width;

  autoFillTopRight.x = autoFillTopCenter.x + autoFillTopCenter.width;
  autoFillMiddleRight.x = autoFillTopRight.x;
  autoFillBottomRight.x = autoFillTopRight.x;

  var y = 0;
  for (var i=0; i<autoFillOptions.children.count; i++) {
    var div = autoFillOptions.children.item(i);
    div.width = autoFillOptions.width;
    div.y = y;
    y += div.height;

    if (div.children.count == 2) {
      div.children.item(1).width = autoFillOptions.width - div.children.item(1).x - 5;
    }
  }

  autoFillOptions.height = y;
  autoFill.height = autoFillOptions.height + autoFillTopCenter.height + autoFillBottomCenter.height;
  autoFillBottomLeft.y = y + autoFillTopLeft.height;
  autoFillBottomCenter.y = y + autoFillTopCenter.height;
  autoFillBottomRight.y = y + autoFillTopRight.height;
  autoFillMiddleLeft.height = y;
  autoFillMiddleRight.height = y;
}

/**
 * Activate search field
 */
SearchField.prototype.activate = function() {
  if (search.value != this.defaultValue) return;
  this.active = true;
  search.value = '';
  search.color = '#000000';
  searchClear.visible = true;
}

/**
 * Blur search field
 */
SearchField.prototype.blur = function() {
  if (!search.value.trim()) {
    this.reset();
  }
}

/**
 * Reset search field
 */
SearchField.prototype.reset = function() {
  var refresh = this.active;
  this.active = false;
  if (refresh) doclist.refresh();

  search.value = this.defaultValue;
  search.color = this.defaultColor;
  searchClear.visible = false;
  autoFill.visible = false;
  doclist.autofillSelected = false;

  window.focus();
}

/**
 * Keyboard controls
 */
SearchField.prototype.keydown = function() {
  switch(event.keycode) {

    case KEYS.ESCAPE:
      this.reset();
      break;

    case KEYS.ENTER:
      if (doclist.autofillSelected !== false) {
        doclist.autofillChoose();
      } else {
        doclist.search();
      }
      break;

    case KEYS.UP:
      doclist.autofillUp();
      break;

    case KEYS.DOWN:
      doclist.autofillDown();
      break;
  }
}

/**
 * Fill in autofill popdown
 */
SearchField.prototype.autofill = function() {
  if (!search.value.trim()) {
    autoFill.visible = false;
    return;
  }

  autoFill.visible = doclist.autofillSearch();
  this.draw();
}

// instantiate object in the global scope
var searchField = new SearchField();
