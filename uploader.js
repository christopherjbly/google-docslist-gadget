
/**
 * Constructor for Uploader class.
 */
function Uploader() {
  this.setup();
  
  commandsUpload.onclick = this.browse.bind(this);
  uploadOption.onclick = this.close.bind(this);     
}

/**
 * Setup uploader
 */
Uploader.prototype.setup = function() {
  this.files = [];
  this.currentFile = -1;  
  
  this.isUploading = false;
  this.isOpen = false;

  this.updateMessage(true);  
  uploaderContent.removeAllElements();
  
  window.dropTarget = true;
  window.ondragdrop = this.dragdrop.bind(this);
}

/**
 * Browse for file
 */
Uploader.prototype.browse = function() {
  var filename = framework.BrowseForFile('*.*');
  if (!filename) return;
  if (!this.isOpen) this.open();
  
  this.newFile(filename);
}

/**
 * Handle drag and dropped file
 */
Uploader.prototype.dragdrop = function() {
  if (!event.dragFiles) return;

  var files = [];

  var e = new Enumerator(event.dragFiles);
  while (!e.atEnd()) {
    files.push(e.item() + '');
    e.moveNext();
  }  
  
  if (!files.length) return;  
  if (!this.isOpen) this.open();
  
  for (var i=0; i<files.length; i++) {
    this.newFile(files[i]);    
  }
}

/**
 * Prepare the file for upload once we have the filename
 */
Uploader.prototype.newFile = function(filename) {
  
  var file = {
    title: filename.replace(/(.*?)\\([^\\]+?)(\.(\w+))?$/, '$2'),
    filename: filename,
    status: UPLOAD_STATUS.WAITING,
    error: false
  };
  
  var extension = filename.replace(/(.*?)\.(\w+)$/, '$2').toLowerCase();  

  // make a guess about which icon to show. if we don't know, 'document' is fine.
  file.type = FILE_TYPES[extension] || 'document';
  
  try {
    var winShell = new ActiveXObject("Wscript.Shell"); 
    file.mime = winShell.RegRead("HKEY_CLASSES_ROOT\\."+extension+"\\Content Type") || false;
  } catch(e) {
    file.mime = false;
  }

  // fall back in case the OS doesn't return a mime type
  if (!file.mime && MIME_TYPES[extension]) {
    file.mime = MIME_TYPES[extension];    
  } else {
    file.mime = 'application/octet-stream';       
  }

  this.files.push(file);   
  this.refresh();  
  if (!this.isUploading) {    
    this.upload();
  }
}

/**
 * Start uploader
 */
Uploader.prototype.upload = function() {  
  if (!this.files.length) return;
  this.isUploading = true;  
  this._upload();
}

/**
 * Do upload
 */
Uploader.prototype._upload = function() {
  this.currentFile++; 
   
  if (this.currentFile < this.files.length) {    
    this.files[this.currentFile].status = UPLOAD_STATUS.LOADING;    
    this.refresh();

    var headers = {
      'Content-Type': this.files[this.currentFile].mime,
      'Slug': this.files[this.currentFile].title
    };
    
    view.setTimeout(function() {
      httpRequest.connect(this.files[this.currentFile].filename, this.uploadSuccess.bind(this), this.uploadError.bind(this), headers, true);    
    }.bind(this), 2000); // needs the delay otherwise consecutive files sometimes return 400 error
    return;
  }
  
  this.currentFile = this.files.length - 1;   
  this.isUploading = false;
  this.updateMessage();
}

/**
 * Mark file as success and start again
 */
Uploader.prototype.updateMessage = function(init) {
  if (init || this.isUploading) {
    uploadStatusLine1.innerText = UPLOAD_UPLOADING;
    uploadStatusLine2.innerText = (this.currentFile+1)+' '+UPLOAD_OF+' '+this.files.length;
    uploadOption.innerText = UPLOAD_CANCEL;
    return;
  }
  
  uploadOption.innerText = UPLOAD_DONE;
  var success = true;

  for (var i=0; i<this.files.length; i++) {
    if (this.files[i].status != UPLOAD_STATUS.SUCCESS) success = false;
  }
  
  if (success) {
    uploadStatusLine1.innerText = UPLOAD_SUCCESS_LINE1;
    uploadStatusLine2.innerText = UPLOAD_SUCCESS_LINE2;
  } else {
    uploadStatusLine1.innerText = UPLOAD_ERROR_LINE1;
    uploadStatusLine2.innerText = UPLOAD_ERROR_LINE2;    
  }  
}

/**
 * Mark file as success and start again
 */
Uploader.prototype.uploadSuccess = function() {
  if (!this.isOpen) return;
  
  this.files[this.currentFile].status = UPLOAD_STATUS.SUCCESS;  
  this.refresh();    
  this._upload();
}

/**
 * Mark file as error and start again
 */
Uploader.prototype.uploadError = function(status, responseText) {
  if (!this.isOpen) return;
  debug.error("Couldn't upload "+this.files[this.currentFile].filename+": "+status+" "+responseText);  
  this.files[this.currentFile].status = UPLOAD_STATUS.ERROR;     
  this.files[this.currentFile].error = UPLOAD_ERRORS['STATUS_'+status] || UPLOAD_ERRORS.CORRUPT;
  this.refresh();  
  this._upload();  
}


/**
 * Refresh uploader contents
 */
Uploader.prototype.refresh = function() {
  uploaderContent.removeAllElements();

  this.updateMessage();

  for (var i=0; i < this.files.length; i++) {
    var file = this.files[i];
    var height = (file.status == UPLOAD_STATUS.ERROR && file.error) ? 33 : 20;
    
    var item = uploaderContent.appendElement('<div />');
    item.height = height;
        
    var newDiv = item.appendElement('<div x="2" y="2" width="16" height="16" />');
    newDiv.background = 'images/icon-upload-'+file.status+'.gif';
    
    var iconDiv = item.appendElement('<div x="22" y="2" width="16" height="16" />');
    iconDiv.background = 'images/icon-'+file.type+'.gif';
    
    var titleLabel = item.appendElement('<label x="46" y="2" font="helvetica" size="8" trimming="character-ellipsis"></label>');
    titleLabel.color = file.status ? '#000000' : '#999999';
    titleLabel.innerText = file.title;
    
    if (file.status == UPLOAD_STATUS.ERROR && file.error) {
      var errorLabel = item.appendElement('<label x="46" y="15" height="15" font="helvetica" size="8" color="#ff0000" trimming="character-ellipsis"></label>');        
      errorLabel.innerText = file.error;
    }

    uploaderContent.appendElement('<div height="1" background="#dddddd" />');
  }
  
  doclist.draw();
}

/**
 * Open uploader
 */
Uploader.prototype.open = function() {
  this.isOpen = true;
  
  sortOptionsArea.visible = false;
  searchArea.visible = false; 
  uploadStatus.visible = true;
  uploaderContent.visible = true;
  doclistContent.visible = false;
  
  doclist.onOpenUploader();
}

/**
 * Close uploader
 */
Uploader.prototype.close = function() {
  if (!this.isOpen) return;
  this.isOpen = false;
  
  sortOptionsArea.visible = true;
  searchArea.visible = true;
  uploadStatus.visible = false; 
  uploaderContent.visible = false;
  doclistContent.visible = true;
  
  httpRequest.stop();
  this.setup();
  doclist.onCloseUploader();
}

// instantiate object in the global scope
var uploader = new Uploader();
