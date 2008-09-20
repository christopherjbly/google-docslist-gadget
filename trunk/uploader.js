
/**
 * Constructor for Uploader class.
 */
function Uploader() {
  this.isOpen = false;  
  this.isUploading = false;
  this.currentFile = -1;  
  this.files = [];
  
  commandsUpload.onclick = this.browse.bind(this);
  uploadOption.onclick = this.close.bind(this);     
}

/**
 * Browse and read file
 */
Uploader.prototype.browse = function() {
  var filename = framework.BrowseForFile('*.*');
  if (!filename) return;
  if (!this.isOpen) this.open();
  
  var stream = new ActiveXObject("ADODB.Stream"); 
  stream.Type = 1;
  stream.open();
  stream.LoadFromFile(filename);
  var contents = stream.Read();

  var file = {
    title: filename.replace(/(.*?)\\([^\\]+?)(\.(\w+))?$/, '$2'),
    contents: contents,
    length: stream.Size,
    status: UPLOAD_STATUS.WAITING,
    type: 'document',
    error: false
  };
  
  var extension = filename.replace(/(.*?)\.(\w+)$/, '$2').toLowerCase();
  
  switch (extension) {
    case 'ppt': case 'prc': case 'pps':
      file.type = 'presentation';
      break;
    case 'csv': case 'xls': case 'wks': case '123':
      file.type = 'spreadsheet';
      break;
  }  
  
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
      'Content-Length': this.files[this.currentFile].length,
      'Slug': this.files[this.currentFile].title
    };
    httpRequest.connect(this.files[this.currentFile].contents, this.uploadSuccess.bind(this), this.uploadError.bind(this), headers);    
    return;
  }
  
  this.currentFile = this.files.length - 1;   
  this.isUploading = false;
}

/**
 * Mark file as success and start again
 */
Uploader.prototype.uploadSuccess = function() {
  this.files[this.currentFile].status = UPLOAD_STATUS.SUCCESS;  
  this.refresh();    
  this._upload();  
}

/**
 * Mark file as error and start again
 */
Uploader.prototype.uploadError = function(status, responseText) {
  debug.error(status);
  debug.error(responseText);
  this.files[this.currentFile].status = UPLOAD_STATUS.ERROR;      
  this.refresh();  
  this._upload();  
}


/**
 * Refresh uploader contents
 */
Uploader.prototype.refresh = function() {
  uploaderContent.removeAllElements();

  uploadStatusLine1.innerText = UPLOAD_UPLOADING;
  uploadStatusLine2.innerText = (this.currentFile+1)+' '+UPLOAD_OF+' '+this.files.length;

  for (var i=0; i < this.files.length; i++) {
    var file = this.files[i];
    
    var item = uploaderContent.appendElement('<div height="20" />');
    var background = file.status ? 'background="images/icon-upload-'+file.status+'.gif"' : '';
    var color = file.status ? '#000000' : '#999999';
    
    item.appendElement('<div x="2" y="2" width="16" height="16" '+background+'/>');          
    item.appendElement('<div x="22" y="2" width="16" height="16" background="images/icon-'+file.type+'.gif" />');
    item.appendElement('<label x="46" y="2" font="helvetica" size="8" color="'+color+'" trimming="character-ellipsis">'+file.title+'</label>');
    if (file.status == UPLOAD_STATUS.ERROR && file.error) {
      item.appendElement('<label x="46" y="15" height="15" font="helvetica" size="8" color="#ff0000" trimming="character-ellipsis">'+file.error+'</label>');           
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
  
  this.reset();
  doclist.onCloseUploader();
}

/**
 * Reset uploader
 */
Uploader.prototype.reset = function() {
  this.files = [];
  uploadStatusLine1.innerText = UPLOAD_UPLOADING;
  uploadStatusLine2.innerText = '0 '+UPLOAD_OF+' 0'; 
  
  uploaderContent.removeAllElements();
  httpRequest.removeHeader('Content-Type');
}

// instantiate object in the global scope
var uploader = new Uploader();
