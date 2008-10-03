/**
 * Constructor for SearchUi class.
 */
function SearchUi(mainDiv, autofillDiv, gadget) {
  this.onSearch = null;
  this.onReset = null;
  this.gadget = gadget;

  this.autofillItems = [];
  this.autofillSelectedIndex = -1;

  this.mainDiv = mainDiv;
  this.content = child(this.mainDiv, 'searchStatusContent');
  this.leftBkg = child(this.mainDiv, 'searchStatusLeft');
  this.rightBkg = child(this.mainDiv, 'searchStatusRight');

  this.area = child(this.content, 'searchArea');
  this.container = child(this.area, 'searchContainer');
  this.field = child(this.container, 'search');
  this.clearButton = child(this.container, 'searchClear');

  this.autofillDiv = autofillDiv;
  this.autofillContent = child(this.autofillDiv, 'autoFillOptions');

  this.defaultValue = this.field.value;
  this.defaultColor = this.field.color;

  this.field.onfocusin = this.activate.bind(this);
  this.field.onclick = this.activate.bind(this);

  this.field.onfocusout = this.blur.bind(this);
  this.field.onchange = this.autofill.bind(this);
  this.field.onkeydown = this.keydown.bind(this);

  this.clearButton.onclick = this.reset.bind(this);
}

SearchUi.prototype.resize = function(width) {
  this.mainDiv.width = width;
  this.content.width = this.mainDiv.width -
      (this.leftBkg.width + this.rightBkg.width);
  this.rightBkg.x = this.content.width + this.content.x;

  this.area.width = this.mainDiv.width - 24;
  this.container.width = this.area.width - 2;
  this.field.width = this.container.width - 23;
  this.clearButton.x = this.field.width + 2;

  this.resizeAutofill();
};

SearchUi.prototype.resizeAutofill = function() {
  var autoFillTopLeft = child(this.autofillDiv, 'autoFillTopLeft');
  var autoFillTopCenter = child(this.autofillDiv, 'autoFillTopCenter');
  var autoFillTopRight = child(this.autofillDiv, 'autoFillTopRight');
  var autoFillMiddleLeft = child(this.autofillDiv, 'autoFillMiddleLeft');
  var autoFillMiddleRight = child(this.autofillDiv, 'autoFillMiddleRight');
  var autoFillBottomLeft = child(this.autofillDiv, 'autoFillBottomLeft');
  var autoFillBottomCenter = child(this.autofillDiv, 'autoFillBottomCenter');
  var autoFillBottomRight = child(this.autofillDiv, 'autoFillBottomRight');

  this.autofillDiv.width = this.area.width + (autoFillTopRight.width + 1);
  autoFillTopCenter.width = this.autofillDiv.width -
      (autoFillTopLeft.width + autoFillTopRight.width);
  this.autofillContent.width = autoFillTopCenter.width;
  autoFillBottomCenter.width = autoFillTopCenter.width;

  autoFillTopRight.x = autoFillTopCenter.x + autoFillTopCenter.width;
  autoFillMiddleRight.x = autoFillTopRight.x;
  autoFillBottomRight.x = autoFillTopRight.x;

  var y = 0;

  for (var i = 0; i < this.autofillContent.children.count; ++i) {
    var div = this.autofillContent.children.item(i);
    div.width = this.autofillContent.width;
    div.y = y;
    y += div.height;

    if (div.children.count == 2) {
      // Not a separator.
      div.children.item(1).width = this.autofillContent.width - div.children.item(1).x - 5;
    }
  }

  this.autofillContent.height = y;
  this.autofillDiv.height = this.autofillContent.height + autoFillTopCenter.height + autoFillBottomCenter.height;
  autoFillBottomLeft.y = y + autoFillTopLeft.height;
  autoFillBottomCenter.y = y + autoFillTopCenter.height;
  autoFillBottomRight.y = y + autoFillTopRight.height;
  autoFillMiddleLeft.height = y;
  autoFillMiddleRight.height = y;
};

SearchUi.prototype.activate = function() {
  if (this.field.value != this.defaultValue) {
    return;
  }
  this.field.value = '';
  this.field.color = '#000000';
  this.clearButton.visible = true;
};

SearchUi.prototype.blur = function() {
  if (!trim(this.field.value)) {
    this.reset();
  }
};

SearchUi.prototype.reset = function() {
  this.field.value = this.defaultValue;
  this.field.color = this.defaultColor;
  this.clearButton.visible = false;

  if (this.onReset) {
    this.onReset();
  }
};

SearchUi.prototype.isAutofillVisible = function() {
  return this.autofillDiv.visible;
};

SearchUi.prototype.hideAutofill = function() {
  this.autofillDiv.visible = false;
};

SearchUi.prototype.showAutofill = function() {
  this.autofillDiv.visible = true;
};

SearchUi.prototype.search = function() {
  if (!trim(this.field.value)) {
    return;
  }

  this.hideAutofill();

  if (this.onSearch) {
    this.onSearch(this.field.value);
  }
};

SearchUi.prototype.keydown = function() {
  switch(event.keycode) {
    case KEYS.ESCAPE:
      this.reset();
      break;
    case KEYS.ENTER:
      if (this.isAutofillVisible() && this.isAutofillSelected()) {
        this.chooseAutofill();
      } else {
        this.search();
      }
      break;
    case KEYS.UP:
      this.onAutofillUp();
      break;
    case KEYS.DOWN:
      this.onAutofillDown();
      break;
  }
};

SearchUi.prototype.chooseAutofill = function() {
  var selected = this.getAutofillSelected();
  if (selected) {
    framework.openUrl(selected.link);
  }

  this.reset();
};

SearchUi.prototype.isAutofillSelected = function() {
  return this.autofillItems.length &&
      this.autofillSelectedIndex >= 0 &&
      this.autofillSelectedIndex < this.autofillItems.length;
};

SearchUi.prototype.getAutofillSelected = function() {
  if (!this.isAutofillSelected()) {
    return;
  }

  return this.autofillItems[this.autofillSelectedIndex];
};

SearchUi.prototype.onAutofillUp = function() {
  if (!this.isAutofillVisible) {
    return;
  }

  if (this.isAutofillSelected()) {
    this.autofillContent.children.item(this.autofillSelectedIndex).background =
        '';
  }

  --this.autofillSelectedIndex;

  if (this.autofillSelectedIndex < 0) {
    this.autofillSelectedIndex = -1;
    return;
  }

  this.autofillContent.children.item(this.autofillSelectedIndex).background =
      SearchUi.AUTOFILL_SELECTED_BACKGROUND;
};

SearchUi.prototype.onAutofillDown = function() {
  if (!this.isAutofillVisible) {
    return;
  }

  if (this.isAutofillSelected()) {
    this.autofillContent.children.item(this.autofillSelectedIndex).background =
        '';
  }

  ++this.autofillSelectedIndex;

  if (this.autofillSelectedIndex >= this.autofillItems.length) {
    this.autofillSelectedIndex = this.autofillItems.length - 1;
  }

  this.autofillContent.children.item(this.autofillSelectedIndex).background =
      SearchUi.AUTOFILL_SELECTED_BACKGROUND;
};

SearchUi.AUTOFILL_SELECTED_BACKGROUND = '#e0ecf7';

SearchUi.prototype.addAutofillItem = function(document) {
    var item = this.autofillContent.appendElement('<div height="20" enabled="true" cursor="hand" />');
    var iconDiv = item.appendElement('<div x="5" y="2" width="16" height="16" />');
    iconDiv.background = document.getIcon();

    var titleLabel = item.appendElement('<label x="28" y="2" font="helvetica" size="8" color="#000000" trimming="character-ellipsis" />');
    titleLabel.innerText = document.title;

    this.resizeAutofill();

    /*
    item.onmouseover = function(index) {
      if (this.autofillSelected !== false) {
        autoFillOptions.children.item(this.autofillSelected).background = '';
      }
      event.srcElement.background='#e0ecf7';
      this.autofillSelected = index;
    }.bind(this, i)

    item.onmouseout = function() {
      event.srcElement.background='';
      this.autofillSelected = false;
    }.bind(this)

    item.onclick = function() {
      searchField.reset();
      framework.openUrl(this.link);
    }.bind(document)
    */
};

SearchUi.prototype.clearAutofill = function() {
  this.autofillSelectedIndex = -1;
  this.autofillContent.removeAllElements();
};

SearchUi.prototype.autofill = function() {
  if (!trim(this.field.value)) {
    this.hideAutofill();
    return;
  }

  this.autofillItems = this.gadget.getAutofillItems(this.field.value);
  this.clearAutofill();

  if (!this.autofillItems.length) {
    this.hideAutofill();
    return;
  }

  for (var i = 0; i < this.autofillItems.length; ++i) {
    this.addAutofillItem(this.autofillItems[i]);
  }

  this.showAutofill();
};
