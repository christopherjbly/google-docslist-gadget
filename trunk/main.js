var g_httpRequest;
var g_authHttpRequest;
var g_errorMessage;

var REPORTED_CLIENT_NAME = 'gd-docslist-gadget-' + strings.VERSION_STRING;

Main.MIN_WIDTH = 170;
Main.MIN_HEIGHT = 200;

function Main() {
  g_httpRequest = new HTTPRequest();
  g_errorMessage = new ErrorMessage();

  this.auth = new Auth();

  this.docsFeed = null;

  this.retrieveTimer = null;
  this.tryCount = 0;

  this.documents = [];
  this.searchDocuments = [];
  this.searchQuery = '';

  this.uploadFiles = [];
  this.isUploading = false;
  this.currentUploadIndex = 0;

  this.window = child(view, 'window');

  this.loginUi = new LoginUi(child(this.window, 'loginDiv'));
  this.loginUi.onLogin = this.onLogin.bind(this);
  this.currentUi = this.loginUi;

  this.usernameLabel = child(this.window, 'username');

  this.docsUi = new DocsUi(child(this.window, 'mainDiv'), this);
  this.docsUi.onSearch = this.onSearch.bind(this);
  this.docsUi.onSearchReset = this.onSearchReset.bind(this);
  view.onmousewheel = this.onMouseWheel.bind(this);
  this.window.onkeydown = this.onKeyDown.bind(this);
  this.window.onkeyup = this.onKeyUp.bind(this);

  this.uploadUi = new UploadUi(child(this.window, 'uploadDiv'));
  this.uploadUi.onDoneCommand = this.onUploadDoneCommand.bind(this);
  this.uploadUi.onCancelCommand = this.onUploadCancelCommand.bind(this);

  this.commandsDiv = child(this.window, 'commands');

  this.uploadCommand = child(this.commandsDiv, 'commandsUpload');

  if (Utils.isWindows()) {
    this.uploadCommand.onclick = this.onUploadClick.bind(this);
  } else {
    this.uploadCommand.visible = false;
  }

  this.signoutCommand = child(this.commandsDiv, 'commandsSignout');
  this.signoutCommand.onclick = this.onSignoutClick.bind(this);
  this.newCommandArrow = child(this.commandsDiv, 'commandsNewArrow');
  this.newCommand = child(this.commandsDiv, 'commandsNew');
  this.newCommand.onclick = this.onNewClick.bind(this);

  this.menuUi = new DocumentMenu(child(this.window, 'newDocument'));
  this.menuUi.onSelected = this.onMenuSelected.bind(this);

  this.window.onclick = this.onWindowClick.bind(this);

  view.onsize = this.resize.bind(this);
  view.onsizing = this.sizing.bind(this);

  if (this.auth.hasCredentials()) {
    this.completeAuth();
  } else {
    this.switchLoginMode();
  }
}

//
// Event handlers.
//

Main.prototype.onDragDrop = function() {
  if (!event.dragFiles) {
    return;
  }

  this.upload(event.dragFiles);
};

Main.prototype.onMenuItems = function(menu) {
  menu.AddItem(strings.COMMAND_REFRESH,
      this.isUploading ? gddMenuItemFlagGrayed : 0,
      this.onRefreshCommand.bind(this));
  var newCommands = menu.AddPopup(strings.COMMAND_NEW);
  newCommands.AddItem(strings.DOCUMENT_DOCUMENT, 0,
      this.onNewDocumentMenuItem.bind(this, Document.DOCUMENT));
  newCommands.AddItem(strings.DOCUMENT_PRESENTATION, 0,
      this.onNewDocumentMenuItem.bind(this, Document.PRESENTATION));
  newCommands.AddItem(strings.DOCUMENT_SPREADSHEET, 0,
      this.onNewDocumentMenuItem.bind(this, Document.SPREADSHEET));
  newCommands.AddItem(strings.DOCUMENT_FORM, 0,
      this.onNewDocumentMenuItem.bind(this, Document.FORM));
  if (Utils.isWindows()) {
    menu.AddItem(strings.COMMAND_UPLOAD,
        this.isUploading ? gddMenuItemFlagGrayed : 0,
        this.browseUpload.bind(this));
  }
  menu.AddItem(strings.COMMAND_SIGN_OUT, 0, this.logout.bind(this));
};

Main.prototype.onMouseWheel = function() {
  if (this.currentUi.mouseWheel) {
    this.currentUi.mouseWheel();
  }
};

Main.prototype.onKeyDown = function() {
  if (this.currentUi.keyDown) {
    this.currentUi.keyDown();
  }
};

Main.prototype.onKeyUp = function() {
  if (this.currentUi.keyUp) {
    this.currentUi.keyUp();
  }
};

Main.prototype.onRefreshCommand = function() {
  if (!Utils.isOnline()) {
    g_errorMessage.display(strings.ERROR_SERVER_OR_NETWORK);
    return;
  }

  this.switchDocsMode();
  this.retrieve();
};

Main.prototype.onUploadDoneCommand = function() {
  this.switchDocsMode();
  this.retrieve();
};

Main.prototype.onUploadCancelCommand = function() {
  this.stopUploads();
};

Main.prototype.onSearch = function(query) {
  if (!Utils.isOnline()) {
    g_errorMessage.display(strings.ERROR_SERVER_OR_NETWORK);
    return;
  }

  this.search(query);
};

Main.prototype.onSearchReset = function() {
  this.searchQuery = '';
  this.docsUi.redraw(this.documents);
  this.window.focus();
};

Main.prototype.onWindowClick = function() {
  this.menuUi.close();
};

Main.prototype.onMenuSelected = function(type) {
  this.launchNewDocument(type);
};

Main.prototype.onUploadClick = function() {
  this.browseUpload();
};

Main.prototype.onSignoutClick = function() {
  this.logout();
};

Main.prototype.onNewClick = function() {
  this.menuUi.toggle();
};

Main.prototype.onLogin = function(username, password, isRemember) {
  this.loginUi.disable();
  this.auth.login(username, password, isRemember,
      this.onLoginSuccess.bind(this),
      this.onLoginFailure.bind(this));
};

Main.prototype.onNewDocumentMenuItem = function(commandLabel, type) {
  this.launchNewDocument(type);
};

//
// Login.
//

Main.prototype.onLoginSuccess = function() {
  this.completeAuth();
};

Main.prototype.completeAuth = function() {
  g_authHttpRequest = new AuthHTTPRequest(g_httpRequest, this.auth);
  this.loginUi.reset();
  this.drawUsername(this.auth.username);
  this.switchDocsMode();
  this.startRetrieve();
};

Main.prototype.logout = function() {
  this.auth.clear();
  this.stopRetrieve();
  this.documents = [];
  this.searchDocuments = [];
  this.switchLoginMode();
};

//
// Retrieval.
//

Main.RETRIEVE_INTERVAL = 10 * 60 * 1000;
Main.MAX_RETRIEVE_INTERVAL = 60 * 60 * 1000;
Main.NETWORK_CHECK_INTERVAL = 30 * 1000;

Main.prototype.retrieve = function() {
  if (!Utils.isOnline()) {
    this.tryCount = 0;
    view.clearInterval(this.retrieveTimer);
    this.retrieveTimer = view.setTimeout(this.retrieve.bind(this),
        Main.NETWORK_CHECK_INTERVAL);
    return;
  }

  if (this.docsFeed) {
    this.docsFeed.destroy();
  }

  if (this.searchQuery) {
    this.docsFeed = new DocsFeed(this.onSearchRetrieve.bind(this),
        this.onRetrieveFail.bind(this), this.searchQuery);
  } else {
    this.docsFeed = new DocsFeed(this.onRetrieve.bind(this),
        this.onRetrieveFail.bind(this));
  }

  this.docsFeed.retrieve();

  ++this.tryCount;
  this.scheduleRetrieve();
};

Main.prototype.onRetrieve = function(feed) {
  this.tryCount = 0;

  if (this.isLoginMode()) {
    return;
  }

  if (feed.startIndex == 1) {
    this.documents = feed.documents;
  } else {
    this.documents.concat(feed.documents);
  }

  this.docsUi.redraw(this.documents);
};

Main.prototype.onRetrieveFail = function() {
  this.logout();
};

Main.prototype.scheduleRetrieve = function() {
  view.clearInterval(this.retrieveTimer);

  var nextRetryMs = Main.RETRIEVE_INTERVAL;

  if (this.tryCount > 1) {
    nextRetryMs *= (this.tryCount - 1) * 2;
  }

  // A dash of randomness.
  var jitter = 60 * 1000;
  jitter *= Math.random();
  jitter = Math.floor(jitter);

  nextRetryMs += jitter;

  if (nextRetryMs > Main.MAX_RETRIEVE_INTERVAL) {
    nextRetryMs = Main.MAX_RETRIEVE_INTERVAL;
  }

  this.retrieveTimer = view.setTimeout(this.retrieve.bind(this),
      nextRetryMs);
};

Main.prototype.startRetrieve = function() {
  this.retrieve();
};

Main.prototype.stopRetrieve = function() {
  view.clearInterval(this.retrieveTimer);
};

Main.prototype.search = function(query) {
  this.searchQuery = query;
  this.retrieve();
};

Main.prototype.onSearchRetrieve = function(feed) {
  if (this.isLoginMode()) {
    return;
  }

  if (!this.searchQuery) {
    return;
  }

  if (feed.startIndex == 1) {
    this.searchDocuments = feed.documents;
  } else {
    this.searchDocuments.concat(feed.documents);
  }

  if (!this.searchDocuments.length) {
    this.docsUi.resetSearch();
    g_errorMessage.display(strings.ERROR_SEARCH_NO_RESULTS);
  } else {
    this.docsUi.redraw(this.searchDocuments);
  }
};

Main.prototype.onLoginFailure = function(code, reason) {
  this.loginUi.enable();
  g_errorMessage.display(reason);
};

//
// Upload section.
//

Main.MAX_UPLOAD = 20;

Main.prototype.upload = function(files) {
  if (this.isUploading) {
    view.alert(strings.ALREADY_UPLOAD);
    return;
  }

  this.switchUploadMode();

  var uploadFiles = [];

  var e = new Enumerator(files);
  var i = 0;

  while (i < Main.MAX_UPLOAD && !e.atEnd()) {
    var path = e.item();
    uploadFiles.push(new UploadFile(path));

    ++i;
    e.moveNext();
  }

  this.uploadFiles = uploadFiles;

  if (!this.uploadFiles.length) {
    return;
  }

  this.startUploads();
};

Main.prototype.drawUploads = function() {
  this.uploadUi.draw(this.uploadFiles, this.isUploading,
      this.currentUploadIndex);
};

Main.prototype.getCurrentUpload = function() {
  return this.uploadFiles[this.currentUploadIndex];
};

Main.COMMANDS_ENABLED_COLOR = '#0065cd';
Main.COMMANDS_DISABLED_COLOR = '#999999';

Main.prototype.startUploads = function() {
  this.currentUploadIndex = 0;
  this.isUploading = true;
  this.uploadCommand.enabled = false;
  this.uploadCommand.color = Main.COMMANDS_DISABLED_COLOR;
  this.drawUploads();
  this.uploadNext();
};

Main.prototype.stopUploads = function() {
  this.isUploading = false;
  this.uploadCommand.enabled = true;
  this.uploadCommand.color = Main.COMMANDS_ENABLED_COLOR;
};

Main.prototype.uploadNext = function() {
  if (this.currentUploadIndex >= this.uploadFiles.length) {
    this.stopUploads();
    this.drawUploads();
    return;
  }

  var file = this.getCurrentUpload();

  if (file.isUnknownType()) {
    this.onUploadError(UploadFile.CODE_415, '', file);
    return;
  }

  if (!this.isUploading) {
    this.onUploadError(UploadFile.CODE_CANCELLED, '', file);
    return;
  }

  file.state = UploadFile.PENDING_STATE;
  this.drawUploads();

  var headers = {
    'Content-Type': file.mime,
    'Slug': file.title };

  debug.trace('Request to upload ' + file.filename);
  g_authHttpRequest.connect(DocsFeed.FEED_URL, file.filename,
       this.onUploadSuccess.bind(this, file),
       this.onUploadError.bind(this, file),
       headers, true);
};

Main.prototype.onUploadSuccess = function(response, file) {
  if (!this.isUploadMode()) {
    return;
  }

  var doc = createDomDocument();
  doc.loadXML(response);

  var links = doc.getElementsByTagName('link');

  for (var j = 0; j < links.length; ++j) {
    var link = links[j];
    if (link.getAttribute('rel') == 'alternate' || !file.link) {
      file.link = link.getAttribute('href');
    }
  }

  file.state = UploadFile.SUCCESS_STATE;
  this.drawUploads();
  ++this.currentUploadIndex;
  this.uploadNext();
};

Main.prototype.onUploadError = function(status, response, file) {
  if (!this.isUploadMode()) {
    return;
  }

  file.state = UploadFile.ERROR_STATE;
  file.errorCode = status;
  this.drawUploads();
  ++this.currentUploadIndex;
  this.uploadNext();
};

Main.prototype.browseUpload = function() {
  var extensions = [];

  for (var i in FILE_EXTENSIONS) {
    extensions.push('*.' + i);
  }

  var filter = strings.SUPPORTED_FILES + '|' + extensions.join(';') +
      '|' + strings.ALL_FILES + '|*.*';

  var files = framework.BrowseForFiles(filter);

  if (!files.count) {
    return;
  }

  this.upload(files);
};

//
// UI modes.
//

Main.prototype.isLoginMode = function() {
  return this.currentUi == this.loginUi;
};

Main.prototype.switchLoginMode = function() {
  this.currentUi = this.loginUi;

  this.loginUi.reset();
  this.loginUi.show();

  this.docsUi.hide();
  this.docsUi.reset();

  this.uploadUi.hide();
  this.uploadUi.reset();

  this.commandsDiv.visible = false;
  this.menuUi.close();
  pluginHelper.onAddCustomMenuItems = null;

  this.drawUsername('');

  this.window.dropTarget = false;
  this.window.ondragdrop = null;
};

Main.prototype.isDocsMode = function() {
  return this.currentUi == this.docsUi;
};

Main.prototype.switchDocsMode = function() {
  this.currentUi = this.docsUi;

  this.loginUi.reset();
  this.loginUi.hide();

  this.docsUi.show();

  this.uploadUi.hide();

  this.commandsDiv.visible = true;
  pluginHelper.onAddCustomMenuItems = this.onMenuItems.bind(this);

  if (Utils.isWindows()) {
    this.window.dropTarget = true;
    this.window.ondragdrop = this.onDragDrop.bind(this);
  }
};

Main.prototype.isUploadMode = function() {
  return this.currentUi == this.uploadUi;
};

Main.prototype.switchUploadMode = function() {
  this.currentUi = this.uploadUi;

  this.loginUi.reset();
  this.loginUi.hide();

  this.docsUi.hide();
  this.docsUi.resetSearch();

  this.uploadUi.show();

  this.commandsDiv.visible = true;
  pluginHelper.onAddCustomMenuItems = this.onMenuItems.bind(this);

  this.window.dropTarget = false;
  this.window.ondragdrop = null;
};

//
// Other.
//

Main.prototype.launchNewDocument = function(type) {
  this.openUrlTokenAuth(
      Document.buildNewDocumentUrl(type, this.auth.appsDomain));
};

Main.prototype.openUrlTokenAuth = function(url) {
  this.auth.tryOpenUrlTokenAuth(url);
};

Main.prototype.drawUsername = function(username) {
  this.usernameLabel.innerText = username;
};

//
// Search autofill.
//

Main.AUTOFILL_MAX = 5;

Main.prototype.getAutofillItems = function(query) {
  var items = [];

  if (query) {
    for (var i = 0;
         i < this.documents.length && items.length < Main.AUTOFILL_MAX; ++i) {
      var document = this.documents[i];
      if (document.title.match(new RegExp('^' + query, 'i'))) {
        items.push(document);
      }
    }
  }

  return items;
};

//
// Sizing.
//

Main.prototype.sizing = function() {
  if (event.width < Main.MIN_WIDTH) {
    event.width = Main.MIN_WIDTH;
  }
  if (event.height < Main.MIN_HEIGHT) {
    event.height = Main.MIN_HEIGHT;
  }
};

Main.prototype.resize = function() {
  this.window.width = view.width - 2;
  this.window.height = view.height - 9;

  var bottomCenterMainBg = child(this.window, 'bottomCenterMainBg');
  var bottomLeftMainBg = child(this.window, 'bottomLeftMainBg');
  var bottomRightMainBg = child(this.window, 'bottomRightMainBg');
  var middleLeftMainBg = child(this.window, 'middleLeftMainBg');
  var middleCenterMainBg = child(this.window, 'middleCenterMainBg');
  var middleRightMainBg = child(this.window, 'middleRightMainBg');
  var topCenterMainBg = child(this.window, 'topCenterMainBg');
  var topRightMainBg = child(this.window, 'topRightMainBg');

  topRightMainBg.x = middleRightMainBg.x = bottomRightMainBg.x =
      this.window.width - topRightMainBg.width;
  topCenterMainBg.width = middleCenterMainBg.width = bottomCenterMainBg.width =
      topRightMainBg.x - topCenterMainBg.x;
  bottomRightMainBg.y = bottomCenterMainBg.y = bottomLeftMainBg.y =
      this.window.height - bottomLeftMainBg.height;
  middleLeftMainBg.height = middleCenterMainBg.height =
      middleRightMainBg.height = bottomRightMainBg.y - middleLeftMainBg.y;

  var loading = child(this.window, 'loading');
  var loadingLabel = child(loading, 'loadingLabel');

  var loadingWidth = labelCalcWidth(loadingLabel);
  loading.x = this.window.width - (loadingWidth + 12);
  loading.width = loadingWidth;

  var searching = child(this.window, 'searching');
  var searchingLabel = child(searching, 'searchingLabel');

  var searchingWidth = labelCalcWidth(searchingLabel);
  searching.x = this.window.width - (searchingWidth + 12);
  searching.width = searchingWidth;

  this.loginUi.resize(this.window.width - 24, this.window.height - 50);
  this.docsUi.resize(this.window.width - 16, this.window.height - 46);
  this.uploadUi.resize(this.window.width - 16, this.window.height - 46);

  // Footer.
  this.commandsDiv.y = this.window.height - 33;
  this.commandsDiv.width = this.window.width - 16;
  this.newCommandArrow.x = labelCalcWidth(this.newCommand) + 2;
  this.newCommandArrow.y = this.newCommandArrow.height + 3;
  this.uploadCommand.x = this.newCommandArrow.x +
      this.newCommandArrow.width + 7;
  this.signoutCommand.x = this.commandsDiv.width -
      (labelCalcWidth(this.signoutCommand) + 4);
  this.menuUi.mainDiv.y = this.commandsDiv.y - this.menuUi.mainDiv.height;
};

var g_gadget = new Main();
