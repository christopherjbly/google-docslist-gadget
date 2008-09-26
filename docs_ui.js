/**
 * Constructor for Doclist class.
 */
function DocsUi(mainDiv) {
  this.content = mainDiv;
  this.draw();
}

DocsUi.prototype.clear = function() {
  this.content.removeAllElements();
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

  this.draw();
};

/**
 * Draw doclist contents
 */
DocsUi.prototype.draw = function() {
  // height and vertical position
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

  // width and horizontal position

//  sortOptions.draw();

  for (i = 0; i < this.content.children.count; ++i) {
    div = this.content.children.item(i);
    div.width = contentContainer.width - (scrollbar.visible ? 0 : 8);

    if (div.children.count > 0) {
      /*
      if (uploader.isOpen) {
        this.drawUploader(div);
      } else {
      */
        this.drawFiles(div);
//      }
    }
  }
//.  customScrollbar.draw();
};


/**
 * Draw doclist file listing
 */
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
