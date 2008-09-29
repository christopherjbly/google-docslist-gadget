
/**
 * Constructor for Doclist class.
 */
function Doclist() {
  this.documents = [];
  this.autofill = [];
  this.results = [];
  this.autofillSelected = false;

  this.content = doclistContent;
}

/**
* Reset doclist
*/
Doclist.prototype.reset = function() {
  this.documents = [];
  this.autofill = [];
  this.results = [];
  this.autofillSelected = false;

  this.clear();
  uploader.close();
};


/**
 * Search doclist
 */
Doclist.prototype.search = function() {
  if (!search.value.trim()) return;
  autoFill.visible = false;

  httpRequest.loadingIndicator = searching;
  this.getChunk(null, search.value.trim());
}

/**
 * Search doclist
 */
Doclist.prototype.searchSuccess = function(responseText) {
  this.getSuccess(responseText, true);
  if (!this.results.length) {
    errorMessage.display(ERROR_SEARCH_NO_RESULTS);
  }
}

/**
 * Display error unless it's a refresh
 */
Doclist.prototype.getError = function(status, responseText) {
  debug.error('error = '+status+' '+responseText);
  if (status == 401) {
    loginSession.logout();
    return;
  }
  if (doclistContent.children.count == 0) {
    errorMessage.display(ERROR_SERVER_OR_NETWORK);
  }
}

/**
 * Autofill search doclist
 */
Doclist.prototype.autofillSearch = function() {
  var value = search.value.trim();
  if (!value) return;

  this.autofill = [];
  this.autofillSelected = false;

  for (var i=0; i<this.documents.length; i++) {
    var document = this.documents[i];
    if (document.title.match(new RegExp('^'+value, 'i'))) {
      this.autofill.push(document);
    }
  }

  if (!this.autofill.length) return false;
  this.autofill.sort(this.sortByName);

  autoFillOptions.removeAllElements();

  for (var i=0; i<this.autofill.length && i<UI.MAX_AUTOFILL; i++) {
    var document = this.autofill[i];

    var item = autoFillOptions.appendElement('<div height="20" enabled="true" cursor="hand" />');
    var iconDiv = item.appendElement('<div x="5" y="2" width="16" height="16" />');
    iconDiv.background = 'images/icon-'+document.type+'.gif';

    var titleLabel = item.appendElement('<label x="28" y="2" font="helvetica" size="8" color="#000000" trimming="character-ellipsis"></label>');
    titleLabel.innerText = document.title;

    item.onmouseover = function(index) {
      if (this.autofillSelected !== false) {
        autoFillOptions.children.item(this.autofillSelected).background = '';
      }
      event.srcElement.background='#e0ecf7';
      this.autofillSelected = index;
    }.bind(this, i)

    item.onmouseout = function() {
      event.srcElement.background='';
      this.autofillSelected = false;
    }.bind(this)

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

Doclist.prototype.clear = function() {
  doclistContent.removeAllElements();
};

/**
 * Refresh doclist contents
 */
Doclist.prototype.refresh = function() {
  this.clear();

  var documents = searchField.active ? this.results : this.documents;

  for (var i = 0; i < documents.length; ++i) {
    var document = documents[i];

    var item = doclistContent.appendElement('<div height="20" cursor="hand" enabled="true" />');

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

    item.onmouseover = function() { event.srcElement.background='#E0ECF7'; }
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
  
  // TODO:
  //  sortOptions.draw();
  
  for (var i = 0; i < this.content.children.count; ++i) {
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
  // TODO:
  // customScrollbar.draw();
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
};

// instantiate object in the global scope
var doclist = new Doclist();
