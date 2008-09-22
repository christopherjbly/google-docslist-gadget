
/**
 * Constructor for Doclist class.
 */
function Doclist() {
  this.documents = [];  
  this.autofill = [];  
  this.results = [];  
  
  this.content = doclistContent;    
}

/**
 * Open doclist after login
 */
Doclist.prototype.login = function() {
  loginDiv.visible = false;
  mainDiv.visible = true;  
  gadget.draw();
  this.startTimeout();
}

/**
* Close doclist after logout
*/
Doclist.prototype.logout = function() {
  this.reset();
  
  loginDiv.visible = true;
  mainDiv.visible = false;  
  gadget.draw();  
  
  this.clearTimeout();  
}

/**
* Reset doclist
*/
Doclist.prototype.reset = function() {
  this.documents = [];  
  this.autofill = [];  
  this.results = [];  
  doclistContent.removeAllElements();
  uploader.close();
}


/**
* Start refresh timer
*/
Doclist.prototype.startTimeout = function() {
  this.clearTimeout();
  this.get();  
  this.timer = view.setTimeout(this.get.bind(this), CONNECTION.REFRESH_INTERVAL);
};

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
  httpRequest.addHeader('Authorization', 'GoogleLogin auth='+loginSession.token);
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
      if (entry.getElementsByTagName('category').length <= 0) continue;
      
      document.title = entry.getElementsByTagName('title')[0].text;
      var date = parseRFC3339(entry.getElementsByTagName('updated')[0].text);
      document.updated = date;
      document.starred = false;
      
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
        if (category.getAttribute('term') == 'http://schemas.google.com/g/2005/labels#starred') {
          document.starred = true;
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
 * Display error unless it's a refresh 
 */
Doclist.prototype.getError = function(status, responseText) {
  if (status == 401) {
    loginSession.logout();
    return;
  }
  if (doclistContent.children.count == 0) {
    errorMessage.display(ERROR_SERVER_OR_NETWORK);      
  }
}

/**
 * Search doclist 
 */
Doclist.prototype.search = function() {
  var value = search.value.trim();
  if (!value) return;
  
  this.autofill = [];
  this.results = [];

  for (var i=0; i<this.documents.length; i++) {
    var document = this.documents[i];
    if (document.title.match(new RegExp('^'+value, 'i'))) {
      this.autofill.push(document);
    }
    if (document.title.match(new RegExp(value, 'i'))) {
      this.results.push(document);
    }    
  }

  if (!this.autofill.length) return false;
  this.autofill.sort(this.sortByName);
  
  autoFillOptions.removeAllElements();
  
  for (var i=0; i<this.autofill.length && i<UI.MAX_AUTOFILL; i++) {    
    var document = this.autofill[i];
    
    var item = autoFillOptions.appendElement('<div height="20" enabled="true" cursor="hand" />');    
    item.appendElement('<div x="5" y="2" width="16" height="16" background="images/icon-'+document.type+'.gif" />');
    item.appendElement('<label x="28" y="2" font="helvetica" size="8" color="#000000" trimming="character-ellipsis">'+document.title+'</label>');
        
    item.onmouseover = function() { event.srcElement.background='#e0ecf7'; }
    item.onmouseout = function() { event.srcElement.background=''; }    
    item.onclick = function() { 
      searchField.reset();      
      framework.openUrl(this.link); 
    }.bind(document)
  }
  
  return true;
}

/**
 * Sort doclist 
 */
Doclist.prototype.sort = function() {
  switch(sortOptions.active) {
    case 'name':
      this.documents.sort(this.sortByName);
      this.refresh();
      break;
      
    case 'date':
      this.documents.sort(this.sortByDate);
      this.refresh();
      break;
      
    default:
      return;
  }
}

/**
 * Sort functions - by name
 */
Doclist.prototype.sortByName = function(a, b) {
  var A = a.title.toLowerCase();
  var B = b.title.toLowerCase();
  if (A < B) return -1;
  if (A > B) return 1;
  return 0;  
}

/**
 * Sort functions - by date
 */
Doclist.prototype.sortByDate = function(a, b) {
  var A = a.updated.getTime();
  var B = b.updated.getTime();
  if (A > B) return -1;
  if (A < B) return 1;
  return 0;      
}

/**
 * Refresh doclist contents
 */
Doclist.prototype.refresh = function() {
  doclistContent.removeAllElements();

  var documents = searchField.active ? this.results : this.documents;

  for (var i=0; i < documents.length; i++) {
    var document = documents[i];

    var item = doclistContent.appendElement('<div height="20" cursor="hand" enabled="true" />');
    item.appendElement('<div x="2" y="2" width="16" height="16" background="images/icon-'+document.type+'.gif" />');
    item.appendElement('<label x="26" y="2" font="helvetica" size="8" color="#000000" trimming="character-ellipsis">'+document.title+'</label>');
    if (document.starred) {
      item.appendElement('<div y="4" width="12" height="12" background="images/icon-star.gif" />');
    }
    item.appendElement('<label y="2" font="helvetica" size="8" color="#66b3ff" align="right">'+document.date+'</label>');

    item.onmouseover = function() { event.srcElement.background='#e0ecf7'; }
    item.onmouseout = function() { event.srcElement.background=''; }
    item.onclick = function() { framework.openUrl(this.link); }.bind(document)
  
    doclistContent.appendElement('<div height="1" background="#dddddd" />');
  }

  this.draw();
}

/**
 * Open uploader
 */
Doclist.prototype.onOpenUploader = function() {
  this.content = uploaderContent;
  this.clearTimeout();
  this.draw();
}

/**
 * Close uploader
 */
Doclist.prototype.onCloseUploader = function() {
  this.content = doclistContent;  
  this.draw(); 
  this.startTimeout();  
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
	
	sortOptions.draw();
	
	for (var i=0; i<this.content.children.count; i++) {
		var div = this.content.children.item(i);
		div.width = contentContainer.width - (scrollbar.visible ? 0 : 8);			
		
		if (div.children.count > 0) {
			if (uploader.isOpen) {
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
