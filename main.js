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

	var self = this;
	view.onsize = function() { self.onSize(); }
	
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

		if (content.height <= contentContainer.height) {
			content.width = contentContainer.width;
			scrollbar.visible = false;			
		} else {
			content.width = contentContainer.width - (scrollbar.width + 14);			
			scrollbar.visible = true;									
		}

		var y = 0;
		for (var i=0; i<content.children.count; i++) {
			var div = content.children.item(i);
			div.width = contentContainer.width - (scrollbar.visible ? 0 : 8);			
			div.y = y;
			y += div.height;
			
			div.onmousewheel = function() { customScrollbar.wheel(); }
			
			if (div.children.count > 0) {
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
			}			
		}
		if (scrollbar.visible && y>0) y--;
		content.height = y;

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

