/**
 * Constructor for SearchField class.
 */
function SearchField(mainDiv) {
  this.onSearch = null;
  this.onReset = null;

  this.mainDiv = mainDiv;
  this.content = child(this.mainDiv, 'searchStatusContent');
  this.leftBkg = child(this.mainDiv, 'searchStatusLeft');
  this.rightBkg = child(this.mainDiv, 'searchStatusRight');

  this.area = child(this.content, 'searchArea');
  this.container = child(this.area, 'searchContainer');
  this.field = child(this.container, 'search');
  this.clearButton = child(this.container, 'searchClear');

  this.defaultValue = this.field.value;
  this.defaultColor = this.field.color;

  this.field.onfocusin = this.activate.bind(this);
  this.field.onclick = this.activate.bind(this);

  this.field.onfocusout = this.blur.bind(this);
  this.field.onchange = this.autofill.bind(this);
  this.field.onkeydown = this.keydown.bind(this);

  this.clearButton.onclick = this.reset.bind(this);
}

SearchField.prototype.resize = function(width) {
  this.mainDiv.width = width;
  this.content.width = this.mainDiv.width -
      this.leftBkg.width + this.rightBkg.width;
  this.rightBkg.x = this.content.width + this.content.x;

  this.area.width = this.mainDiv.width - 24;
  this.container.width = this.area.width - 2;
  this.field.width = this.container.width - 23;
  this.clearButton.x = this.field.width + 2;

  /*
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
  */
};

SearchField.prototype.activate = function() {
  if (this.field.value != this.defaultValue) {
    return;
  }
  this.field.value = '';
  this.field.color = '#000000';
  this.field.visible = true;
};

SearchField.prototype.blur = function() {
  if (!trim(this.field.value)) {
    this.reset();
  }
};

SearchField.prototype.reset = function() {
  if (this.onReset) {
    this.onReset();
  }

  this.field.value = this.defaultValue;
  this.field.color = this.defaultColor;
  this.clearButton.visible = false;
//  autoFill.visible = false;
//  doclist.autofillSelected = false;
//  window.focus();
};

SearchField.prototype.keydown = function() {
  switch(event.keycode) {
    case KEYS.ESCAPE:
      this.reset();
      break;
    case KEYS.ENTER:
      if (this.onSearch) {
        this.onSearch();
      }
      /*
      if (doclist.autofillSelected !== false) {
        doclist.autofillChoose();
      } else {
        doclist.search();
      }
      */
      break;
    case KEYS.UP:
      // doclist.autofillUp();
      break;
    case KEYS.DOWN:
      // doclist.autofillDown();
      break;
  }
};

SearchField.prototype.autofill = function() {
  /*
  if (!trim(search.value)) {
    autoFill.visible = false;
    return;
  }

  autoFill.visible = doclist.autofillSearch();
  this.draw();
  */

};
