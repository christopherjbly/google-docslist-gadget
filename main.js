var g_httpRequest;
var g_errorMessage;

/**
 * Constructor for Main class.
 */
function Main() {
}

/**
 * Draw the gadget when the view opens.
 */
Main.prototype.onOpen = function() {
  g_httpRequest = new HTTPRequest();
  g_errorMessage = new ErrorMessage();

  this.retrieveTimer = null;
  this.documents = [];

  // Set up menu management handler.
  pluginHelper.onAddCustomMenuItems = this.onMenuItems.bind(this);

  view.onsize = this.draw.bind(this);
  view.onsizing = this.sizing.bind(this);
  this.window = window;  // window is name of the div.
  this.usernameLabel = child(this.window, 'username');
  this.auth = new Auth();
  this.docsUi = new DocsUi(child(this.window, 'mainDiv'));
  this.loginUi = new LoginUi(child(this.window, 'loginDiv'));
  this.loginUi.onLogin = this.onLogin.bind(this);
  this.sortUi = new SortUi(sortOptionsArea);  // sortOptionsArea is name of div.

  this.draw();
};

Main.prototype.onLogin = function(username, password, isRemember) {
  this.auth.login(username, password, isRemember,
      this.onLoginSuccess.bind(this),
      this.onLoginFailure.bind(this));
};

Main.prototype.onLoginSuccess = function() {
  this.loginUi.reset();
  this.drawUsername(this.auth.username);
  this.switchDocsMode();
  this.startRetrieve();
};

Main.prototype.onLoginFailure = function(code, reason) {
  g_errorMessage.display(reason);
};

Main.RETRIEVE_INTERVAL = 60 * 1000;

Main.prototype.retrieve = function() {
  debug.error('foo');
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

/**
 * Resize the gadget.
 */
Main.prototype.draw = function() {
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

  if (loginDiv.visible) {
    loginDiv.width = window.width - 24;
    loginDiv.height = window.height - 50;
    user.width = pass.width = loginDiv.width - user.x - user.x;
    login.x = loginDiv.width - login.width;
    login.y = loginDiv.height - (login.height + 10);
  }

  if (mainDiv.visible) {
    mainDiv.width = window.width - 16;
    mainDiv.height = window.height - 46;

    searchStatus.width = mainDiv.width;
    searchStatusContent.width = mainDiv.width - (searchStatusLeft.width + searchStatusRight.width);
    searchStatusRight.x = searchStatusContent.width + searchStatusContent.x;

    searchArea.width = searchStatus.width - 24;
    searchContainer.width = searchArea.width - 2;
    search.width = searchContainer.width - 23;
    searchClear.x = search.width + 2;

    searchField.draw();

    uploadStatus.width = searchContainer.width - 2;
    uploadOption.x = uploadStatus.width - labelCalcWidth(uploadOption);

    contentArea.width = mainDiv.width;
    contentArea.height = mainDiv.height - (searchStatus.height + 14) - 5;

    contentContainer.width = contentArea.width - contentShadowRight.width;
    contentContainer.height = contentArea.height - contentShadowBottom.height;

    doclist.draw();

    contentShadowBottom.width = contentContainer.width - contentShadowBottomLeft.width;
    contentShadowRight.height = contentArea.height - contentShadowBottomRight.height;
    contentShadowBottom.x = contentShadowBottomLeft.width;
    contentShadowRight.x = contentContainer.width;
    contentShadowBottom.y = contentContainer.height;
    contentShadowBottomLeft.y = contentContainer.height;
    contentShadowBottomRight.x = contentContainer.width;
    contentShadowBottomRight.y = contentContainer.height;

    commands.y = contentArea.height + contentArea.y + 5;
    commands.width = contentArea.width;
    commandsNewArrow.x = labelCalcWidth(commandsNew) + 2;
    commandsNewArrow.y = commandsNewArrow.height + 3;

    commandsUpload.x = commandsNewArrow.x + commandsNewArrow.width + 7;
    commandsSignout.x = commands.width - (labelCalcWidth(commandsSignout) + 4);

    newDocument.y = mainDiv.height - (newDocument.height - commands.height - 13);
  }
};

// instantiate object in the global scope
var gadget = new Main();

