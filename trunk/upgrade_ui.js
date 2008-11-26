// Copyright 2008 Google Inc.
// All Rights Reserved.

function UpgradeUi(mainDiv) {
  this.mainDiv = mainDiv;

  this.reasonLabel = child(this.mainDiv, 'upgradeReason');
  this.downloadLink = child(this.mainDiv, 'upgradeDownloadUrl');
  this.infoLink = child(this.mainDiv, 'upgradeInfoUrl');
}

UpgradeUi.prototype.resize = function(width, height) {
  this.mainDiv.width = width;
  this.mainDiv.height = height;
};

UpgradeUi.prototype.hide = function() {
  this.mainDiv.visible = false;
};

UpgradeUi.prototype.show = function() {
  this.mainDiv.visible = true;
};
