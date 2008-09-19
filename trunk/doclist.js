
/**
 * Constructor for Doclist class.
 */
function Doclist() {
  this.documents = [];  
  this.isUploaderOpen = false;  
  this.content = doclistContent;    
  
  commandUpload.onclick = this.openUploader.bind(this);
  uploadOption.onclick = this.closeUploader.bind(this);     
}

/**
 * Open doclist after login
 */
Doclist.prototype.login = function() {
  loginDiv.visible = false;
  mainDiv.visible = true;  
  gadget.draw();
  this.get();

  this.clearTimeout();
  this.timer = view.setTimeout(this.get.bind(this), CONNECTION.REFRESH_INTERVAL);
}

/**
* Close doclist after logout
*/
Doclist.prototype.logout = function() {
  loginDiv.visible = true;
  mainDiv.visible = false;  
  gadget.draw();  
  
  this.clearTimeout();  
}

/**
* Clear refresh timer
*/
Doclist.prototype.clearTimeout = function() {
  if (this.timer) {
    view.clearTimeout(this.timer);
    this.timer = null;
  }
};

/**
 * Get doclist 
 */
Doclist.prototype.get = function() {
  httpRequest.host = CONNECTION.DOCS_HOST;
  httpRequest.url = CONNECTION.DOCS_URL;    
  httpRequest.connect('', this.getSuccess.bind(this), this.getError.bind(this));      
}

/**
 * Get doclist 
 */
Doclist.prototype.getSuccess = function(responseText) {
  
  try {
    doc = new DOMDocument();
    doc.loadXML(responseText);
	  rootTagName = doc.documentElement.tagName;
	  if (rootTagName != 'feed') throw "";
  } catch(e) {
    debug.error('Could not load XML.');
    this.getError();    
    return false;
  }
  
  this.documents = [];  
  
  try {
    var entryElements = doc.getElementsByTagName('entry');
    for (var i=0; i < entryElements.length; i++) {
      var entry = entryElements[i];      
      var document = {};
     
      if (entry.getElementsByTagName('title').length <= 0) continue;
      if (entry.getElementsByTagName('updated').length <= 0) continue;
      if (entry.getElementsByTagName('link').length <= 0) continue;
      
      document.title = entry.getElementsByTagName('title')[0].text;
      var date = parseRFC3339(entry.getElementsByTagName('updated')[0].text);
      document.updated = date;
      
      // format date
      var now = new Date();
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.formatDate('n j Y') == now.formatDate('n j Y')) {
        document.date = date.formatDate('g:ia');
      } else if (date.formatDate('n j Y') == yesterday.formatDate('n j Y')) {
        document.date = DATE_YESTERDAY;
      } else {
        document.date = date.formatDate('M j');        
      }

      var links = entry.getElementsByTagName('link');
      
      for (var j=0; j < links.length; j++) {
        var link = links[j];
        if (link.getAttribute('rel') == 'alternate' || !document.link) {
          document.link = link.getAttribute('href');
        }
      }
      
      var categories = entry.getElementsByTagName('category');
      
      for (var j=0; j < categories.length; j++) {
        var category = categories[j];
        if (category.getAttribute('scheme') == 'http://schemas.google.com/g/2005#kind') {
          document.type = category.getAttribute('label');
        }
      }      
      
      switch(document.type) {
        case 'spreadsheet': case 'form': case 'document': case 'presentation': break;
        default: continue;
      }
      
      this.documents.push(document);
    }   
  } catch(e) {
    debug.error('Could not parse XML.');
    this.getError();
    return;
  }

  this.sort();
}

/**
 * Get doclist 
 */
Doclist.prototype.getError = function(status, responseText) {
  if (doclistContent.children.count == 0) {
    errorMessage.display(ERROR_SERVER_OR_NETWORK);
    this.clearTimeout();
  }
}

/**
 * Sort doclist 
 */
Doclist.prototype.sort = function() {
  switch(sortOptions.active) {
    case 'name':
      var fn = function(a, b) {
        var A = a.title.toLowerCase();
        var B = b.title.toLowerCase();
        if (A < B) return -1;
        if (A > B) return 1;
        return 0;
      }
      break;
    case 'date':
      var fn = function(a, b) {
        var A = a.updated.getTime();
        var B = b.updated.getTime();
        if (A > B) return -1;
        if (A < B) return 1;
        return 0;      
      }    
      break;
    default:
      return;
  }

  this.documents.sort(fn);
  this.refresh();
}

/**
 * Refresh doclist contentes
 */
Doclist.prototype.refresh = function() {
  doclistContent.removeAllElements();

  for (var i=0; i<this.documents.length; i++) {

    var document = this.documents[i];

    var file = doclistContent.appendElement('<div height="20" cursor="hand" enabled="true" />');
    file.appendElement('<div x="2" y="2" width="16" height="16" background="images/icon-'+document.type+'.gif" />');
    file.appendElement('<label x="26" y="2" font="helvetica" size="8" color="#000000" trimming="character-ellipsis">'+document.title+'</label>');
    file.appendElement('<label y="2" font="helvetica" size="8" color="#66b3ff" align="right">'+document.date+'</label>');

    file.onmouseover = function() { event.srcElement.background='#e0ecf7'; }
    file.onmouseout = function() { event.srcElement.background=''; }
    file.onclick = function() { framework.openUrl(this.link); }.bind(document)
  
    doclistContent.appendElement('<div height="1" background="#dddddd" />');
  }

  this.draw();
}

/**
 * Open uploader
 */
Doclist.prototype.openUploader = function() {
  this.isUploaderOpen = true;
  this.content = uploaderContent;
  
  sortOptionsArea.visible = false;
  searchArea.visible = false; 
  uploadStatus.visible = true;
  uploaderContent.visible = true;
  doclistContent.visible = false;
  
  this.draw();
}

/**
 * Close uploader
 */
Doclist.prototype.closeUploader = function() {
  if (!this.isUploaderOpen) return;
  this.isUploaderOpen = false;
  this.content = doclistContent;  
  
  sortOptionsArea.visible = true;
  searchArea.visible = true;
  uploadStatus.visible = false; 
  uploaderContent.visible = false;
  doclistContent.visible = true;
  
  this.draw(); 
}

/**
 * Draw doclist contents
 */
Doclist.prototype.draw = function() {
	
	// height and vertical position 
	
	var y = 0;
	for (var i=0; i<this.content.children.count; i++) {
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
    this.content.height--;
	}
	
	// width and horizontal position
	
	for (var i=0; i<this.content.children.count; i++) {
		var div = this.content.children.item(i);
		div.width = contentContainer.width - (scrollbar.visible ? 0 : 8);			
				
		if (div.children.count > 0) {
			if (this.isUploaderOpen) {
				this.drawUploader(div);				
			} else {
				this.drawFiles(div);
			}
		}			
	}	
	customScrollbar.draw();   
}

/**
 * Draw doclist uploader
 */
Doclist.prototype.drawUploader = function(div) {
	div.children.item(2).width = div.width - div.children.item(2).x;
}

/**
 * Draw doclist file listing
 */
Doclist.prototype.drawFiles = function(div) {
	
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
	
}

// instantiate object in the global scope
var doclist = new Doclist();
