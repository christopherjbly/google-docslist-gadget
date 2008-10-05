UploadFile.NEW_STATE = '';
UploadFile.PENDING_STATE = 'loading';
UploadFile.SUCCESS_STATE = 'success';
UploadFile.ERROR_STATE = 'error';

function UploadFile(filename) {
  this.filename = filename;
  this.title = this.filename.replace(/(.*?)\\([^\\]+?)(\.(\w+))?$/, '$2');
  this.state = UploadFile.NEW_STATE;
  this.errorCode = null;
  this.extension = filename.replace(/(.*?)\.(\w+)$/, '$2').toLowerCase();

  this.type = Document.UNKNOWN;
  this.mime = 'text/plain';

  var extensionDesc = FILE_EXTENSIONS[this.extension];

  if (extensionDesc) {
    this.type = extensionDesc.type;
    this.mime = extensionDesc.mime;
  }
}

UploadFile.prototype.isNew = function() {
  return this.state == UploadFile.NEW_STATE;
};

UploadFile.prototype.isPending = function() {
  return this.state == UploadFile.PENDING_STATE;
};

UploadFile.prototype.isSuccess = function() {
  return this.state == UploadFile.SUCCESS_STATE;
};

UploadFile.prototype.isError = function() {
  return this.state == UploadFile.ERROR_STATE;
};

UploadFile.prototype.isDone = function() {
  return this.isSuccess() || this.isError();
};

UploadFile.prototype.isUnknownType = function() {
  return this.type == Document.UNKNOWN;
};

UploadFile.prototype.getIcon = function() {
  return 'images/icon-' + this.type + '.gif';
};

UploadFile.prototype.getStatusIcon = function() {
  return 'images/icon-upload-' + this.state + '.gif';
};

UploadFile.prototype.getError = function() {
  if (this.isUnknownType()) {
    return strings.ERROR_UPLOAD_TYPE;
  } else if (this.errorCode == 415) {
    return strings.ERROR_UPLOAD_TYPE;
  } else if (this.errorCode == 401) {
    return strings.ERROR_UPLOAD_EXPIRED;
  } else if (this.errorCode === 0) {
    return strings.ERROR_UPLOAD_NETWORK;
  } else {
    return strings.ERROR_UPLOAD_CORRUPT;
  }
};
