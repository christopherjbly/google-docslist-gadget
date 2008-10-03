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

  // Set up menu management handler.
  pluginHelper.onAddCustomMenuItems = this.onMenuItems.bind(this);

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
  this.resize();
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

  this.docsUi.clear();
  this.docsUi.drawDocuments(this.searchDocuments);

  /*
  this.sort();
  */
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
};

Main.prototype.onSignoutClick = function() {
  this.logout();
};

Main.prototype.onNewClick = function() {
  this.menuUi.toggle();
};

Main.prototype.onSortChange = function() {
  if (this.sortUi.isDate()) {
    debug.trace('date');
  } else {
    debug.trace('aint');
  }
};

Main.prototype.onLogin = function(username, password, isRemember) {
  /********
  this.loginUi.reset();
  this.switchDocsMode();
  return;
  */
  this.auth.login(username, password, isRemember,
      this.onLoginSuccess.bind(this),
      this.onLoginFailure.bind(this));
};

Main.prototype.onLoginSuccess = function() {
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
};

Main.prototype.logout = function() {
  this.auth.clear();
  // TODO: Clear content.
  // stop timers.
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

  this.docsUi.clear();
  this.docsUi.drawDocuments(this.documents);

  /*
  this.sort();
  */
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
};

Main.prototype.switchDocsMode = function() {
  this.loginUi.hide();
  this.docsUi.show();
};

Main.prototype.drawUsername = function(username) {
  this.usernameLabel.innerText = username;
};

/*
Main.prototype.isLoggedIn = function() {
  return !loginDiv.visible && mainDiv.visible;
};
*/

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
  if (this.isLoggedIn()) {
    menu.AddItem(strings.COMMAND_REFRESH, 0, doclist.get.bind(doclist));

    var newCommands = menu.AddPopup(strings.COMMAND_NEW);
    newCommands.AddItem(strings.DOCUMENT_DOCUMENT, 0,
        function() {
          framework.openUrl(NEW_DOC['newDocumentDocument']);
        });
    newCommands.AddItem(strings.DOCUMENT_PRESENTATION, 0,
        function() {
          framework.openUrl(NEW_DOC['newDocumentPresentation']);
        });
    newCommands.AddItem(strings.DOCUMENT_SPREADSHEET, 0,
        function() {
          framework.openUrl(NEW_DOC['newDocumentSpreadsheet']);
        });
    newCommands.AddItem(strings.DOCUMENT_FORM, 0,
        function() {
          framework.openUrl(NEW_DOC['newDocumentForm']);
        });

    menu.AddItem(strings.COMMAND_UPLOAD, 0, uploader.browse.bind(uploader));
    menu.AddItem(strings.COMMAND_SIGN_OUT, 0, loginSession.logout.bind(loginSession));
  }
};

/**
 * Override the user's sizing if we go under.
 */
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

  topRightMainBg.x = middleRightMainBg.x = bottomRightMainBg.x =
      this.window.width - topRightMainBg.width;
  topCenterMainBg.width = middleCenterMainBg.width = bottomCenterMainBg.width =
      topRightMainBg.x - topCenterMainBg.x;
  bottomRightMainBg.y = bottomCenterMainBg.y = bottomLeftMainBg.y =
      this.window.height - bottomLeftMainBg.height;
  middleLeftMainBg.height = middleCenterMainBg.height =
      middleRightMainBg.height = bottomRightMainBg.y - middleLeftMainBg.y;

  // Adjust the positions of a images to move to the top right corner
  var loadingWidth = labelCalcWidth(loadingLabel);
  loading.x = this.window.width - (loadingWidth + 12);
  loading.width = loadingWidth;

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

    this.docsUi.resize();

  }
  */

  // Footer.
  this.commandsDiv.y = this.window.height - 33;
  this.commandsDiv.width = contentArea.width;
  this.newCommandArrow.x = labelCalcWidth(this.newCommand) + 2;
  this.newCommandArrow.y = this.newCommandArrow.height + 3;
  this.uploadCommand.x = this.newCommandArrow.x +
      this.newCommandArrow.width + 7;
  this.signoutCommand.x = this.commandsDiv.width -
      (labelCalcWidth(this.signoutCommand) + 4);
  this.menuUi.mainDiv.y = this.commandsDiv.y - this.menuUi.mainDiv.height;
};

// instantiate object in the global scope
var gadget = new Main();
