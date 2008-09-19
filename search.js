/**
 * Constructor for SearchField class.
 */
function SearchField() {
  this.defaultValue = search.value;
  this.defaultColor = search.color;
  
  search.onfocusin = this.activate.bind(this);
  search.onclick = this.activate.bind(this);

  search.onfocusout = this.blur.bind(this);
  search.onchange = this.autofill.bind(this);
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
}

/**
 * Activate search field
 */
SearchField.prototype.activate = function() {
  if (search.value != this.defaultValue) return;
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
  search.value = this.defaultValue;
  search.color = this.defaultColor;
  searchClear.visible = false;
  autoFill.visible = false;
}

/**
 * Fill in autofill popdown
 */
SearchField.prototype.autofill = function() {
  if (!search.value.trim()) {
    autoFill.visible = false;   
    return;
  }
  
  this.draw();
  autoFill.visible = true;
}

// instantiate object in the global scope
var searchField = new SearchField();
