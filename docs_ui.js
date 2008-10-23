function DocsUi(mainDiv, gadget) {
  this.mainDiv = mainDiv;
  this.gadget = gadget;
  this.onSearch = null;
  this.onSearchReset = null;

  this.contentArea = child(this.mainDiv, 'contentArea');
  this.container = child(this.contentArea, 'contentContainer');
  this.content = child(this.container, 'doclistContent');
  this.scrollbar = new CustomScrollbar(child(this.container, 'scrollbar'));
  this.scrollbar.onChange = this.onScroll.bind(this);

  this.documents = [];

  this.sortUi = new SortUi(child(this.mainDiv, 'sortOptionsArea'));
  this.sortUi.onChange = this.onSortChange.bind(this);
  this.searchUi = new SearchUi(child(this.mainDiv, 'searchStatus'),
      child(this.gadget.window, 'autoFill'), this.gadget);

  this.itemNameWidth = 0;
  this.searchUi.onSearch = this.onSearchUiSearch.bind(this);
  this.searchUi.onReset = this.onSearchUiReset.bind(this);
}

DocsUi.prototype.mouseWheel = function() {
  this.scrollbar.wheel();
};

DocsUi.prototype.keyDown = function() {
  this.scrollbar.keydown();
};

DocsUi.prototype.keyUp = function() {
  this.scrollbar.keyup();
};

DocsUi.prototype.onScroll = function(value) {
  this.content.y = -value;
};

DocsUi.prototype.onSortChange = function() {
  this.draw();
};

DocsUi.prototype.onSearchUiSearch = function(query) {
  if (this.onSearch) {
    this.onSearch(query);
  }
};

DocsUi.prototype.onSearchUiReset = function() {
  if (this.onSearchReset) {
    this.onSearchReset();
  }
};

DocsUi.prototype.reset = function() {
  this.documents = [];
  this.resetSearch();
  this.draw();
};

DocsUi.prototype.resetSearch = function() {
  this.searchUi.reset();
};

DocsUi.prototype.clear = function() {
  this.content.removeAllElements();
};

DocsUi.prototype.show = function() {
  this.mainDiv.visible = true;
};

DocsUi.prototype.hide = function() {
  this.mainDiv.visible = false;
};

DocsUi.prototype.sort = function() {
  if (this.sortUi.isDate()) {
    this.documents.sort(DocsUi.sortByDate);
  } else {
    this.documents.sort(DocsUi.sortByName);
  }
};

DocsUi.sortByName = function(a, b) {
  a = a.title.toLowerCase();
  b = b.title.toLowerCase();
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
};

DocsUi.sortByDate = function(a, b) {
  a = a.updated.getTime();
  b = b.updated.getTime();
  if (a > b) {
    return -1;
  } else if (a < b) {
    return 1;
  } else {
    return 0;
  }
};

DocsUi.prototype.redraw = function(documents) {
  this.documents = documents;
  this.draw();
};

DocsUi.prototype.draw = function() {
  this.sort();
  var documents = this.documents;
  this.clear();

  for (var i = 0; i < documents.length; ++i) {
    var document = documents[i];

    var item = this.content.appendElement('<div width="100%" height="20" cursor="hand" enabled="true" />');

    var iconDiv = item.appendElement('<div name="icon" x="2" y="2" width="16" height="16" />');
    iconDiv.background = document.getIcon();

    var titleLabel = item.appendElement('<label name="title" x="21" y="2" font="helvetica" size="8" color="#000000" trimming="character-ellipsis" />');
    titleLabel.innerText = document.title;
    titleLabel.tooltip = document.title;

    var starDiv = item.appendElement('<div name="star" y="4" width="12" height="12" background="images/icon-star.gif" visible="false" />');
    starDiv.visible = document.starred;

    var dateLabel = item.appendElement('<label name="date" y="2" font="helvetica" size="8" color="#66b3ff" align="right" />');
    dateLabel.innerText = document.date;
    dateLabel.tooltip = document.date;

    item.onmouseover = function() { event.srcElement.background='#E0ECF7'; };
    item.onmouseout = function() { event.srcElement.background=''; };
    item.onclick = g_gadget.openUrlTokenAuth.bind(g_gadget, document.link);

    this.content.appendElement('<div height="1" background="#dddddd" />');
  }

  this.resizeContent();
};

DocsUi.prototype.resizeContent = function() {
  var y = 0;

  for (var i = 0; i < this.content.children.count; ++i) {
    var div = this.content.children.item(i);
    div.y = y;
    y += div.height;
  }

  this.content.height = y;

  this.content.width = this.container.width - 14;

  if (this.content.height <= this.container.height) {
    this.scrollbar.hide();
  } else {
    this.content.width -= this.scrollbar.getWidth();
    this.scrollbar.show();
    this.scrollbar.setMax(this.content.height - this.container.height);
    this.scrollbar.resize(this.content.width + 9,
        this.container.height,
        this.content.height === 0 ?
            1 :
            this.container.height / this.content.height);
  }

  for (i = 0; i < this.content.children.count; ++i) {
    div = this.content.children.item(i);

    if (div.children.count > 0) {
      // Not a separator.
      var icon = child(div, 'icon');
      var title = child(div, 'title');
      var star = child(div, 'star');
      var date = child(div, 'date');

      var itemNameWidth = this.itemNameWidth;

      if (itemNameWidth > this.content.width) {
        itemNameWidth = this.content.width;
      }

      title.width = itemNameWidth - icon.width - 3;

      if (star.visible) {
        title.width -= star.width;
        var starX = title.x + labelCalcWidth(title);
        if (starX > title.x + title.width) {
          starX = title.x + title.width;
        }
        star.x = starX;
      }

      date.x = this.itemNameWidth + 2;
      date.width = this.content.width - date.x;
    }
  }
};

DocsUi.MIN_ITEM_NAME_WIDTH = 175;
DocsUi.MAX_ITEM_DATE_WIDTH = 85;
DocsUi.MIN_ITEM_DATE_WIDTH = 80;

DocsUi.prototype.resize = function(width, height) {
  this.mainDiv.width = width;
  this.mainDiv.height = height;

  this.contentArea.width = this.mainDiv.width;
  this.contentArea.height = this.mainDiv.height - 83;

  var contentShadowBottom = child(this.contentArea, 'contentShadowBottom');
  var contentShadowBottomLeft = child(this.contentArea, 'contentShadowBottomLeft');
  var contentShadowRight = child(this.contentArea, 'contentShadowRight');
  var contentShadowBottomRight = child(this.contentArea, 'contentShadowBottomRight');

  this.container.width = this.contentArea.width - contentShadowRight.width;
  this.container.height = this.contentArea.height - contentShadowBottom.height;
  contentShadowBottom.width = this.container.width - contentShadowBottomLeft.width;
  contentShadowRight.height = this.contentArea.height - contentShadowBottomRight.height;
  contentShadowBottom.x = contentShadowBottomLeft.width;
  contentShadowRight.x = this.container.width;
  contentShadowBottom.y = this.container.height;
  contentShadowBottomLeft.y = this.container.height;
  contentShadowBottomRight.x = this.container.width;
  contentShadowBottomRight.y = this.container.height;

  var contentWidth = this.mainDiv.width - 6;

  var availableDateWidth = contentWidth - DocsUi.MIN_ITEM_NAME_WIDTH;
  var itemNameWidth = contentWidth - availableDateWidth;

  if (availableDateWidth < DocsUi.MIN_ITEM_DATE_WIDTH) {
    // Date got squeezed out :(
    itemNameWidth = contentWidth;
  } else if (availableDateWidth > DocsUi.MAX_ITEM_DATE_WIDTH) {
    itemNameWidth = contentWidth - DocsUi.MAX_ITEM_DATE_WIDTH;
  }

  this.itemNameWidth = itemNameWidth;
  this.sortUi.resize(contentWidth, this.itemNameWidth);
  this.searchUi.resize(this.mainDiv.width);

  this.resizeContent();
};
