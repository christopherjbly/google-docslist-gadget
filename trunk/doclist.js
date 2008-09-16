/**
 * Constructor for Doclist class.
 */
function Doclist() {
}

/**
 * Draw doclist contents
 */
Doclist.prototype.draw = function() {
	
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
			if (uploader.isOpen) {
				this.drawUploader(div);				
			} else {
				this.drawFiles(div);
			}
		}			
	}
	if (scrollbar.visible && y>0) y--;
	content.height = y;
}

/**
 * Draw doclist uploader
 */
Doclist.prototype.drawUploader = function() {
	
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
	
}

// instantiate object in the global scope
var doclist = new Doclist();
