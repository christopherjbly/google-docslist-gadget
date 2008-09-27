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
  this.docsFeed = null;

  // Set up menu management handler.
  pluginHelper.onAddCustomMenuItems = this.onMenuItems.bind(this);

  this.window = child(view, 'window');

  this.loginUi = new LoginUi(child(this.window, 'loginDiv'));
  this.loginUi.onLogin = this.onLogin.bind(this);
  this.mainDiv = child(this.window, 'mainDiv');
  this.usernameLabel = child(this.window, 'username');
  this.docsUi = new DocsUi(child(this.mainDiv, 'contentArea'));
  this.sortUi = new SortUi(child(this.mainDiv, 'sortOptionsArea'));
  this.sortUi.onChange = this.onSortChange.bind(this);
  this.searchUi = new SearchField(child(this.mainDiv, 'searchStatus'));

  this.commandsDiv = child(this.mainDiv, 'commands');
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
  this.menuUi.open();
};

Main.prototype.onSortChange = function() {
  if (this.sortUi.isDate()) {
    debug.trace('date');
  } else {
    debug.trace('aint');
  }
};

Main.prototype.onLogin = function(username, password, isRemember) {
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
  this.switchLoginMode();
};

Main.RETRIEVE_INTERVAL = 60 * 1000;

Main.prototype.retrieve = function() {
  this.docsFeed = new DocsFeed(this.onRetrieve.bind(this),
      this.onRetrieveFail.bind(this));
  this.docsFeed.retrieve();
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

Main.prototype.showMainUi = function() {
  this.mainDiv.visible = true;
};

Main.prototype.hideMainUi = function() {
  this.mainDiv.visible = false;
};

Main.prototype.switchLoginMode = function() {
  this.loginUi.show();
  this.hideMainUi();
};

Main.prototype.switchDocsMode = function() {
  this.loginUi.hide();
  this.showMainUi();
};

Main.prototype.drawUsername = function(username) {
  this.usernameLabel.innerText = username;
};

Main.prototype.isLoggedIn = function() {
  return !loginDiv.visible && mainDiv.visible;
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

Main.prototype.resize = function() {
  window.width = view.width - 2;
  window.height = view.height - 9;

  topRightMainBg.x = middleRightMainBg.x = bottomRightMainBg.x =
      window.width - topRightMainBg.width;
  topCenterMainBg.width = middleCenterMainBg.width = bottomCenterMainBg.width =
      topRightMainBg.x - topCenterMainBg.x;
  bottomRightMainBg.y = bottomCenterMainBg.y = bottomLeftMainBg.y =
      window.height - bottomLeftMainBg.height;
  middleLeftMainBg.height = middleCenterMainBg.height =
      middleRightMainBg.height = bottomRightMainBg.y - middleLeftMainBg.y;

  // Adjust the positions of a images to move to the top right corner
  var loadingWidth = labelCalcWidth(loadingLabel);
  loading.x = window.width - (loadingWidth + 12);
  loading.width = loadingWidth;

  var searchingWidth = labelCalcWidth(searchingLabel);
  searching.x = window.width - (searchingWidth + 12);
  searching.width = searchingWidth;

  // resize sub UI's here.
  this.loginUi.resize(window.width - 24, window.height - 50);

  if (mainDiv.visible) {
    mainDiv.width = window.width - 16;
    mainDiv.height = window.height - 46;

    this.searchUi.resize(mainDiv.width);

    uploadStatus.width = searchContainer.width - 2;
    uploadOption.x = uploadStatus.width - labelCalcWidth(uploadOption);

    contentArea.width = mainDiv.width;
    contentArea.height = mainDiv.height - (searchStatus.height + 14) - 5;

    contentContainer.width = contentArea.width - contentShadowRight.width;
    contentContainer.height = contentArea.height - contentShadowBottom.height;

    doclist.draw();

    var contentWidth = mainDiv.width - 6;
    var nameWidth = Math.ceil((2/3) * contentWidth);
    this.sortUi.resize(contentWidth, nameWidth);

    contentShadowBottom.width = contentContainer.width - contentShadowBottomLeft.width;
    contentShadowRight.height = contentArea.height - contentShadowBottomRight.height;
    contentShadowBottom.x = contentShadowBottomLeft.width;
    contentShadowRight.x = contentContainer.width;
    contentShadowBottom.y = contentContainer.height;
    contentShadowBottomLeft.y = contentContainer.height;
    contentShadowBottomRight.x = contentContainer.width;
    contentShadowBottomRight.y = contentContainer.height;

    this.commandsDiv.y = contentArea.height + contentArea.y + 5;
    this.commandsDiv.width = contentArea.width;
    this.newCommandArrow.x = labelCalcWidth(this.newCommand) + 2;
    this.newCommandArrow.y = this.newCommandArrow.height + 3;
    this.uploadCommand.x = this.newCommandArrow.x +
        this.newCommandArrow.width + 7;
    this.signoutCommand.x = this.commandsDiv.width -
        (labelCalcWidth(this.signoutCommand) + 4);
    this.menuUi.mainDiv.y = mainDiv.height -
        this.menuUi.mainDiv.height - this.commandsDiv.height - 13;
  }
};

// instantiate object in the global scope
var gadget = new Main();
