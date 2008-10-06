// TODO: what to do about retrieve requests that stagger in.
// 1. after a refresh.

var g_httpRequest;
var g_authHttpRequest;
var g_errorMessage;

var REPORTED_CLIENT_NAME = 'gd-docslist-gadget-' + strings.VERSION_STRING;

var UI = {
  MIN_WIDTH: 170,
  MIN_HEIGHT: 200,
  MIN_DATE_WIDTH: 85 };

var KEYS = {
  ENTER: 13,
  ESCAPE: 27,
  SPACE: 32,
  UP: 38,
  DOWN: 40,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  HOME: 36,
  END: 35 };

function Main() {
  g_httpRequest = new HTTPRequest();
  g_errorMessage = new ErrorMessage();

  this.auth = new Auth();

  this.retrieveTimer = null;
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
  this.uploadCommand.onclick = this.onUploadClick.bind(this);
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
  var newCommands = menu.AddPopup(strings.COMMAND_NEW);
  newCommands.AddItem(strings.DOCUMENT_DOCUMENT, 0,
      this.onNewDocumentMenuItem.bind(this, Document.DOCUMENT));
  newCommands.AddItem(strings.DOCUMENT_PRESENTATION, 0,
      this.onNewDocumentMenuItem.bind(this, Document.PRESENTATION));
  newCommands.AddItem(strings.DOCUMENT_SPREADSHEET, 0,
      this.onNewDocumentMenuItem.bind(this, Document.SPREADSHEET));
  newCommands.AddItem(strings.DOCUMENT_FORM, 0,
      this.onNewDocumentMenuItem.bind(this, Document.FORM));
  menu.AddItem(strings.COMMAND_REFRESH, 0, this.retrieve.bind(this));
  menu.AddItem(strings.COMMAND_UPLOAD, 0, this.browseUpload.bind(this));
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

Main.prototype.onUploadDoneCommand = function() {
  this.switchDocsMode();
  this.retrieve();
};

Main.prototype.onUploadCancelCommand = function() {
  this.isUploading = false;
};

Main.prototype.onSearch = function(query) {
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
  view.clearInterval(this.retrieveTimer);
  this.documents = [];
  this.searchDocuments = [];
  this.switchLoginMode();
};

//
// Retrieval.
//

Main.RETRIEVE_INTERVAL = 15 * 60 * 1000;

Main.prototype.retrieve = function() {
  var docsFeed;

  if (this.searchQuery) {
    docsFeed = new DocsFeed(this.onSearchRetrieve.bind(this),
        this.onRetrieveFail.bind(this), this.searchQuery);
  } else {
    docsFeed = new DocsFeed(this.onRetrieve.bind(this),
        this.onRetrieveFail.bind(this));
  }

  docsFeed.retrieve();
};

Main.prototype.onRetrieve = function(feed) {
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

Main.prototype.startRetrieve = function() {
  this.retrieve();
  view.clearInterval(this.retrieveTimer);
  this.retrieveTimer = view.setInterval(this.retrieve.bind(this),
      Main.RETRIEVE_INTERVAL);
};

Main.prototype.stopRetrieve = function() {
  this.clearInterval(this.retrieveTimer);
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

Main.prototype.startUploads = function() {
  this.currentUploadIndex = 0;
  this.isUploading = true;
  this.drawUploads();
  this.uploadNext();
};

Main.prototype.uploadNext = function() {
  if (this.currentUploadIndex >= this.uploadFiles.length) {
    this.isUploading = false;
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

  g_authHttpRequest.connect(DocsFeed.FEED_URL, file.filename,
       this.onUploadSuccess.bind(this, file),
       this.onUploadError.bind(this, file),
       headers, true);

//  view.setTimeout(this.onUploadSuccess.bind(this, file), 3000);
};

Main.prototype.onUploadSuccess = function(file) {
  if (!this.isUploadMode()) {
    return;
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

  this.window.dropTarget = true;
  this.window.ondragdrop = this.onDragDrop.bind(this);
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

  this.window.dropTarget = true;
  this.window.ondragdrop = this.onDragDrop.bind(this);
};

//
// Other.
//

Main.prototype.launchNewDocument = function(type) {
  alert(Document.buildNewDocumentUrl(type));
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
  if (event.width < UI.MIN_WIDTH) {
    event.width = UI.MIN_WIDTH;
  }
  if (event.height < UI.MIN_HEIGHT) {
    event.height = UI.MIN_HEIGHT;
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
