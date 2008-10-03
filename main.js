// TODO: what to do about retrieve requests that stagger in.
// 1. after logged out.
// 2. after a refresh.
// TODO: move sort order to SortUi class.

var g_httpRequest;
var g_authHttpRequest;
var g_errorMessage;

/**
 * Constructor for Main class.
 */
function Main() {
  g_httpRequest = new HTTPRequest();
  g_errorMessage = new ErrorMessage();

  this.auth = new Auth();

  this.retrieveTimer = null;
  this.documents = [];
  this.searchDocuments = [];

  this.window = child(view, 'window');

  this.loginUi = new LoginUi(child(this.window, 'loginDiv'));
  this.loginUi.onLogin = this.onLogin.bind(this);
  this.usernameLabel = child(this.window, 'username');
  this.docsUi = new DocsUi(child(this.window, 'mainDiv'), this);
  // TODO:
  this.docsUi.scrollbar.onChange = this.onScroll.bind(this);
  /*kku
  view.onmousewheel = this.docsUi.scrollbar.wheel.bind(this.docsUi.scrollbar);
  this.window.onkeydown = this.docsUi.scrollbar.keydown.bind(this.docsUi.scrollbar);
  this.window.onkeyup = this.docsUi.scrollbar.keyup.bind(this.docsUi.scrollbar);
  */

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

Main.prototype.onSearch = function(query) {
  this.search(query);
};

Main.prototype.search = function(query) {
  var docsFeed = new DocsFeed(this.onSearchRetrieve.bind(this),
      this.onSearchFail.bind(this), query);
  docsFeed.retrieve();
};

Main.prototype.onSearchRetrieve = function(feed) {
  if (feed.startIndex == 1) {
    this.searchDocuments = feed.documents;
  } else {
    this.searchDocuments.concat(feed.documents);
  }

  this.docsUi.redraw(this.searchDocuments);
};

Main.prototype.onSearchFail = function() {
  // TODO: what if not logged in?
  this.logout();
};

Main.prototype.onSearchReset = function() {
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

Main.prototype.onLoginFailure = function(code, reason) {
  g_errorMessage.display(reason);
};

Main.prototype.launchNewDocument = function(type) {
  alert(Document.buildNewDocumentUrl(type));
};

Main.prototype.browseUpload = function() {
};

Main.prototype.logout = function() {
  this.auth.clear();
  view.clearInterval(this.retrieveTimer);
  this.documents = [];
  this.searchDocuments = [];
  this.switchLoginMode();
};

Main.RETRIEVE_INTERVAL = 60 * 1000;

Main.prototype.retrieve = function() {
  var docsFeed = new DocsFeed(this.onRetrieve.bind(this),
      this.onRetrieveFail.bind(this));
  docsFeed.retrieve();
};

Main.prototype.onRetrieve = function(feed) {
  if (feed.startIndex == 1) {
    this.documents = feed.documents;
  } else {
    this.documents.concat(feed.documents);
  }

  this.docsUi.redraw(this.documents);
};

Main.prototype.onRetrieveFail = function() {
  // TODO: what if not logged in?
  this.logout();
};

Main.prototype.startRetrieve = function() {
  this.retrieve();
  this.retrieveTimer = view.setInterval(this.retrieve.bind(this),
      Main.RETRIEVE_INTERVAL);
};

Main.prototype.stopRetrieve = function() {
  this.clearInterval(this.retrieveTimer);
};

Main.prototype.switchLoginMode = function() {
  this.loginUi.show();
  this.docsUi.hide();
  this.commandsDiv.visible = false;
  pluginHelper.onAddCustomMenuItems = null;
};

Main.prototype.switchDocsMode = function() {
  this.loginUi.hide();
  this.docsUi.show();
  this.commandsDiv.visible = true;
  pluginHelper.onAddCustomMenuItems = this.onMenuItems.bind(this);
};

Main.prototype.drawUsername = function(username) {
  this.usernameLabel.innerText = username;
};

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

Main.prototype.onNewDocumentMenuItem = function(commandLabel, type) {
  this.launchNewDocument(type);
};

Main.prototype.sizing = function() {
  if (event.width < UI.MIN_WIDTH) {
    event.width = UI.MIN_WIDTH;
  }
  if (event.height < UI.MIN_HEIGHT) {
    event.height = UI.MIN_HEIGHT;
  }
};

Main.prototype.onScroll = function(value) {
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

  /*
  if (this.mainDiv.visible) {


 //   uploadStatus.width = searchContainer.width - 2;
 //   uploadOption.x = uploadStatus.width - labelCalcWidth(uploadOption);

    doclist.draw();
  }
  */

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
