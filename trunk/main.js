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
  // XXX: tmp
  uploader.open();
};

/**
 * Draw the gadget when the view opens.
 */
Main.prototype.onOpen = function() {

  view.onsize = this.onSize.bind(this); 
  this.onSize();
}

/**
 * Resize the gadget.
 */
Main.prototype.onSize = function() {
  
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
  imgLoading.x = window.width - 60;

  if (loginDiv.visible) {
    loginDiv.width = window.width - 24;
    loginDiv.height = window.height - 50;
    user.width = pass.width = loginDiv.width - user.x - user.x;
    login.x = loginDiv.width - login.width;
  }
  
  if (mainDiv.visible) {
    
    mainDiv.width = window.width - 16; 
    mainDiv.height = window.height - 46;    
    
    searchStatus.width = mainDiv.width;
    sortOptions.width = mainDiv.width - 6;
    sortOptions.x = 2;
        
    sortOptionsName.width = Math.ceil((2/3) * sortOptions.width);
    sortOptionsNameDateDivider.x = sortOptionsName.width;
    sortOptionsDateNameDivider.x = sortOptionsName.width;
    
    sortOptionsDate.x = sortOptionsNameDateDivider.width + sortOptionsNameDateDivider.x;
    sortOptionsDate.width = sortOptions.width - (sortOptionsName.width + sortOptionsNameDateDivider.width);
    
    sortOptionsNameArrow.x = sortOptionsName.width - (sortOptionsNameArrow.width + 5);    
    sortOptionsDateArrow.x = sortOptionsDate.width - (sortOptionsDateArrow.width + 5);
    
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
    contentArea.height = mainDiv.height - (searchStatus.height + 14);
    
    contentContainer.width = contentArea.width - contentShadowRight.width;
    contentContainer.height = contentArea.height - contentShadowBottom.height;

    doclist.draw();
    customScrollbar.draw();

    contentShadowBottom.width = contentContainer.width - contentShadowBottomLeft.width;
    contentShadowRight.height = contentArea.height - contentShadowBottomRight.height;
    contentShadowBottom.x = contentShadowBottomLeft.width;
    contentShadowRight.x = contentContainer.width;
    contentShadowBottom.y = contentContainer.height;
    contentShadowBottomLeft.y = contentContainer.height;
    contentShadowBottomRight.x = contentContainer.width;
    contentShadowBottomRight.y = contentContainer.height;
    
    commands.y = contentArea.height + contentArea.y;
    commands.width = contentArea.width;
    commandsNewArrow.x = labelCalcWidth(commandsNew) + 2;
    commandsNewArrow.y = commandsNewArrow.height + 3;
    
    commandUpload.x = commandsNewArrow.x + commandsNewArrow.width + 7;
    commandSignout.x = commands.width - (labelCalcWidth(commandSignout) + 4);
  
    newDocument.y = mainDiv.height - (newDocument.height - commands.height - 13);
  }
}

// instantiate object in the global scope
var mainView = new Main();

