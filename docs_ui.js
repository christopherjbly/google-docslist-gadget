/**
 * Constructor for Doclist class.
 */
function DocsUi(mainDiv, gadget) {
  this.mainDiv = mainDiv;
  this.gadget = gadget;
  this.contentArea = child(this.mainDiv, 'contentArea');
  this.container = child(this.contentArea, 'contentContainer');
  this.content = child(this.container, 'doclistContent');
  this.scrollbar = new CustomScrollbar(child(this.container, 'scrollbar'));

  this.sortUi = new SortUi(child(this.mainDiv, 'sortOptionsArea'));
  this.searchUi = new SearchUi(child(this.mainDiv, 'searchStatus'),
      child(this.gadget.window, 'autoFill'), this.gadget);
//  this.sortUi.onChange = this.onSortChange.bind(this);
/*
  this.searchUi.onSearch = this.onSearch.bind(this);
  this.searchUi.onReset = this.onSearchReset.bind(this);
  */
}

DocsUi.prototype.clear = function() {
  this.content.removeAllElements();
};

DocsUi.prototype.show = function() {
  this.mainDiv.visible = true;
};

DocsUi.prototype.hide = function() {
  this.mainDiv.visible = false;
};

/**
 * Refresh doclist contents
 */
DocsUi.prototype.drawDocuments = function(documents) {
  this.clear();

  for (var i = 0; i < documents.length; ++i) {
    var document = documents[i];

    var item = this.content.appendElement('<div height="20" cursor="hand" enabled="true" />');

    var iconDiv = item.appendElement('<div x="2" y="2" width="16" height="16" />');
    iconDiv.background = "images/icon-" + document.type + ".gif";

    var titleLabel = item.appendElement('<label x="26" y="2" font="helvetica" size="8" color="#000000" trimming="character-ellipsis" />');
    titleLabel.innerText = document.title;
    titleLabel.tooltip = document.title;

    if (document.starred) {
      item.appendElement('<div y="4" width="12" height="12" background="images/icon-star.gif" />');
    }

    var dateLabel = item.appendElement('<label y="2" font="helvetica" size="8" color="#66b3ff" align="right" />');
    dateLabel.innerText = document.date;

    item.onmouseover = function() { event.srcElement.background='#E0ECF7'; };
    item.onmouseout = function() { event.srcElement.background=''; };
    item.onclick = function() { framework.openUrl(this.link); }.bind(document);

    this.content.appendElement('<div height="1" background="#dddddd" />');
  }

//  this.resize();
};

/**
 * Draw doclist contents
 */
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
  var nameWidth = Math.ceil((2/3) * contentWidth);
  this.sortUi.resize(contentWidth, nameWidth);
  this.searchUi.resize(this.mainDiv.width);

    // TODO:
  this.scrollbar.setMax(this.content.height - this.container.height);
  this.scrollbar.resize(this.content.width + 9,
      this.container.height,
      this.content.height === 0 ?
          1 :
          this.container.height / this.content.height);

  // height and vertical position
  /*
  var y = 0;
  for (var i = 0; i < this.content.children.count; ++i) {
    var div = this.content.children.item(i);
    div.y = y;
    y += div.height;
  }

  this.content.height = y;

  // show or hide scrollbar

  if (this.content.height <= contentContainer.height) {
    this.content.width = contentContainer.width;
    scrollbar.visible = false;
  } else {
    this.content.width = contentContainer.width - (scrollbar.width + 14);
    scrollbar.visible = true;
    --this.content.height;
  }
  */

  // width and horizontal position

//  sortOptions.draw();

  /*
  for (i = 0; i < this.content.children.count; ++i) {
    div = this.content.children.item(i);
    div.width = contentContainer.width - (scrollbar.visible ? 0 : 8);

    if (div.children.count > 0) {
//      if (uploader.isOpen) {
//        this.drawUploader(div);
//      } else {
//        this.drawFiles(div);
//      }
    }
  }
    */
//.  customScrollbar.draw();
};


/**
 * Draw doclist file listing
 */
/*
DocsUi.prototype.drawFiles = function(div) {
  var dateLabel;
  div.children.item(1).width = sortOptionsName.width - div.children.item(1).x;

  if (div.children.count == 4) {
    div.children.item(1).width = (div.children.item(1).width - div.children.item(2).width - 2);
    var width = labelCalcWidth(div.children.item(1));
    width = (width > div.children.item(1).width) ? div.children.item(1).width : width;
    div.children.item(2).x = width + div.children.item(1).x;
    dateLabel = div.children.item(3);
  } else {
    dateLabel = div.children.item(2);
  }

  dateLabel.x = sortOptionsDate.x;
  dateLabel.width = (sortOptionsDate.width - scrollbar.width - (9 + 4) + (scrollbar.visible ? 0 : (scrollbar.width + 8)));
};
*/
