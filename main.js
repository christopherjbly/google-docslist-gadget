/**
 * Main
 *
 * Doclist view
 *
 * Created by Steve Simitzis on 2008-3-21.
 * Copyright (c) 2008 Google. All rights reserved.
 */


/**
 * Constructor for Main class.
 */
function Main() {
};

/**
 * Draw the gadget when the view opens.
 */
Main.prototype.onOpen = function() {
  // Set up menu management handler.
  pluginHelper.onAddCustomMenuItems = this.onMenuItems.bind(this);

  view.onsize = this.draw.bind(this);
  view.onsizing = this.sizing.bind(this);
  loginSession.autologin();
  this.draw();
}

Main.prototype.isLoggedIn = function() {
  return !loginDiv.visible && mainDiv.visible;
};

Main.prototype.onMenuItems = function(menu) {
  if (this.isLoggedIn()) {
    menu.AddItem(strings.COMMAND_REFRESH, 0, doclist.get.bind(doclist));
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
}

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
}

// instantiate object in the global scope
var gadget = new Main();

