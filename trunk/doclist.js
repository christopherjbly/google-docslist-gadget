
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
  this.autofillSelected = false;

  this.clear();
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

Doclist.prototype.getFeedUrl = function(startIndex, opt_searchQuery) {
  var url = CONNECTION.DOCS_URL;
  var params = {};
  params[CONNECTION.MAX_RESULTS_PARAM] = CONNECTION.MAX_RESULTS;
  params[CONNECTION.START_INDEX_PARAM] = startIndex;

  if (opt_searchQuery) {
    params[CONNECTION.SEARCH_PARAM] = opt_searchQuery;
  }

  return url + '?' + params.toQueryString();
};

/**
 * Get doclist
 */
Doclist.prototype.get = function() {
  this.getChunk();
}

Doclist.DOCS_THRESHOLD = 50;

Doclist.prototype.getChunk = function(opt_startIndex, opt_searchQuery) {
  var startIndex = opt_startIndex || 1;

  if (startIndex >= Doclist.DOCS_THRESHOLD) {
    // Don't continue if we're past the threshold.
    return;
  }

  httpRequest.host = CONNECTION.DOCS_HOST;
  httpRequest.url = this.getFeedUrl(startIndex, opt_searchQuery);
  httpRequest.addHeader('Authorization', 'GoogleLogin auth='+loginSession.token);

  if (opt_searchQuery) {
    httpRequest.connect('', this.searchSuccess.bind(this), this.getError.bind(this));
  } else {
    httpRequest.connect('', this.getSuccess.bind(this), this.getError.bind(this));
  }
}

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
 * Get doclist
 */
Doclist.prototype.getSuccess = function(responseText, search) {
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

  try {
    var totalResults = Number(doc.getElementsByTagName('openSearch:totalResults')[0].text);
    debug.error(totalResults);
    var startIndex = Number(doc.getElementsByTagName('openSearch:startIndex')[0].text);
    debug.error(startIndex);
    var itemsPerPage = Number(doc.getElementsByTagName('openSearch:itemsPerPage')[0].text);
    debug.error(itemsPerPage);
    var entryElements = doc.getElementsByTagName('entry');

    if (isNaN(totalResults) || isNaN(startIndex) || isNaN(itemsPerPage)) {
      debug.error('Invalid paging data.');
      return;
    }

    if (startIndex == 1) {
      if (search) {
        this.results = [];
      } else {
        this.documents = [];
      }
    }

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

      if (search) {
        this.results.push(document);
      } else {
        this.documents.push(document);
      }
    }
  } catch(e) {
    debug.error('Could not parse XML.');
    this.getError();
    return;
  }

  var nextIndex = startIndex + itemsPerPage;

  if (nextIndex - 1 < totalResults) {
    // There are more to retrieve.
    this.getChunk(nextIndex);
  }

  this.sort();
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
 * Enter key in autofill list
 */
Doclist.prototype.autofillChoose = function() {
  if (!this.autofill.length || !autoFillOptions.children.count) return;
  if (this.autofillSelected === false) return;
  if (this.autofillSelected > this.autofill.length) return;

  framework.openUrl(this.autofill[this.autofillSelected].link);
  searchField.reset();
}

/**
 * Up arrow in autofill list
 */
Doclist.prototype.autofillUp = function() {
  if (!this.autofill.length || !autoFillOptions.children.count) return;
  if (this.autofillSelected === false) return;

  autoFillOptions.children.item(this.autofillSelected).background = '';
  if (this.autofillSelected == 0) {
    this.autofillSelected = false;
    return;
  }

  this.autofillSelected--;
  autoFillOptions.children.item(this.autofillSelected).background = '#e0ecf7';
}

/**
 * Down arrow in autofill list
 */
Doclist.prototype.autofillDown = function() {
  if (!this.autofill.length || !autoFillOptions.children.count) return;

  if (this.autofillSelected === false) {
    this.autofillSelected = 0;
  } else if (this.autofillSelected >= autoFillOptions.children.count-1) {
    return;
  } else {
    autoFillOptions.children.item(this.autofillSelected).background = '';
    this.autofillSelected++;
  }

  autoFillOptions.children.item(this.autofillSelected).background = '#e0ecf7';
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
