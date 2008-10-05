function UploadUi(mainDiv, gadget) {
  this.onDoneCommand = null;
  this.onCancelCommand = null;

  this.mainDiv = mainDiv;
  this.gadget = gadget;

  this.status = child(this.mainDiv, 'status');
  this.statusLeft = child(this.status, 'statusLeft');
  this.statusRight = child(this.status, 'statusRight');
  this.statusContent = child(this.status, 'statusContent');
  this.uploadStatus = child(this.statusContent, 'uploadStatus');
  this.statusLine1 = child(this.uploadStatus, 'uploadStatusLine1');
  this.statusLine2 = child(this.uploadStatus, 'uploadStatusLine2');
  this.doneOption = child(this.uploadStatus, 'doneOption');
  this.doneOption.onclick = this.onDoneClick.bind(this);
  this.cancelOption =  child(this.uploadStatus, 'cancelOption');
  this.cancelOption.onclick = this.onCancelClick.bind(this);

  this.contentArea = child(this.mainDiv, 'contentArea');
  this.container = child(this.contentArea, 'contentContainer');
  this.content = child(this.container, 'uploaderContent');
  this.scrollbar = new CustomScrollbar(child(this.container, 'scrollbar'));
  this.scrollbar.onChange = this.onScroll.bind(this);
}

UploadUi.prototype.mouseWheel = function() {
  this.scrollbar.wheel();
};

UploadUi.prototype.keyDown = function() {
  this.scrollbar.keydown();
};

UploadUi.prototype.keyUp = function() {
  this.scrollbar.keyup();
};

UploadUi.prototype.onDoneClick = function() {
  if (this.onDoneCommand) {
    this.onDoneCommand();
  }
};

UploadUi.prototype.onCancelClick = function() {
  if (this.onCancelCommand) {
    this.onCancelCommand();
  }
};

UploadUi.prototype.onScroll = function(value) {
  this.content.y = -value;
};

UploadUi.prototype.clear = function() {
  this.content.removeAllElements();
};

UploadUi.prototype.show = function() {
  this.mainDiv.visible = true;
};

UploadUi.prototype.hide = function() {
  this.mainDiv.visible = false;
};

UploadUi.prototype.reset = function() {
  this.draw([]);
};

UploadUi.prototype.draw = function(files, isUploading, currentFileIndex) {
  this.clear();

  var isAllSuccess = true;

  for (var i = 0; i < files.length; ++i) {
    var file = files[i];

    var item = this.content.appendElement('<div width="100%" enabled="true" />');
    item.height = 20;

    var newDiv = item.appendElement('<div x="2" y="2" width="16" height="16" />');
    newDiv.background = file.getStatusIcon();

    var iconDiv = item.appendElement('<div x="22" y="2" width="16" height="16" />');
    iconDiv.background = file.getIcon();

    var titleLabel = item.appendElement('<label name="title" x="46" y="2" font="helvetica" size="8" trimming="character-ellipsis" />');
    titleLabel.color = file.isNew() ? '#999999' : '#000000';
    titleLabel.innerText = file.title;

    if (file.isError()) {
      item.height = 33;
      var errorLabel = item.appendElement('<label x="46" width="100%" y="15" height="15" font="helvetica" size="8" color="#ff0000" trimming="character-ellipsis" />');
      errorLabel.innerText = file.getError();
    }

    if (!file.isSuccess()) {
      isAllSuccess = false;
    }

    item.onmouseover = function() { event.srcElement.background='#E0ECF7'; };
    item.onmouseout = function() { event.srcElement.background=''; };

    this.content.appendElement('<div height="1" width="100%" background="#dddddd" />');
  }

  // TODO: open success files with a click.
  // item.onclick = function() { framework.openUrl(this.link); }.bind(document);

  this.resizeContent();

  if (isUploading) {
    this.statusLine1.innerText = strings.UPLOAD_UPLOADING;
    this.statusLine2.innerText = (currentFileIndex + 1) + ' ' +
        strings.UPLOAD_OF + ' ' + files.length;
    this.cancelOption.visible = true;
    this.doneOption.visible = false;
  } else {
    this.cancelOption.visible = false;
    this.doneOption.visible = true;

    if (isAllSuccess) {
      this.statusLine1.innerText = strings.UPLOAD_SUCCESS_LINE1;
      this.statusLine2.innerText = strings.UPLOAD_SUCCESS_LINE2;
    } else {
      this.statusLine1.innerText = strings.UPLOAD_ERROR_LINE1;
      this.statusLine2.innerText = strings.UPLOAD_ERROR_LINE2;
    }
  }
};

UploadUi.prototype.resizeContent = function() {
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
      div.children.item('title').width = this.content.width - div.children.item('title').x;
    }
  }
};

UploadUi.prototype.resize = function(width, height) {
  this.mainDiv.width = width;
  this.mainDiv.height = height;

  this.contentArea.width = this.mainDiv.width;
  this.contentArea.height = this.mainDiv.height - 83;

  var contentShadowBottom = child(this.contentArea, 'contentShadowBottom');
  var contentShadowBottomLeft = child(this.contentArea, 'contentShadowBottomLeft');
  var contentShadowRight = child(this.contentArea, 'contentShadowRight');
  var contentShadowBottomRight = child(this.contentArea, 'contentShadowBottomRight');

  this.status.width = this.mainDiv.width;
  this.statusContent.width = this.mainDiv.width -
      (this.statusLeft.width + this.statusRight.width);
  this.statusRight.x = this.statusContent.width + this.statusContent.x;
  this.uploadStatus.width = this.mainDiv.width - 28;
  this.doneOption.x = this.uploadStatus.width - labelCalcWidth(this.doneOption);
  this.cancelOption.x = this.uploadStatus.width -
      labelCalcWidth(this.cancelOption);

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

  this.resizeContent();
};
