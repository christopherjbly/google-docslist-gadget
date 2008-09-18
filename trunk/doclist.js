
/**
 * Constructor for Doclist class.
 */
function Doclist() {
  this.isUploaderOpen = false;  
  this.content = doclistContent;    
  
  commandUpload.onclick = this.openUploader.bind(this);
  uploadOption.onclick = this.closeUploader.bind(this);  
   
  newDocumentForm.onclick = this.newDocument.bind(this);
  newDocumentPresentation.onclick = this.newDocument.bind(this);
  newDocumentSpreadsheet.onclick = this.newDocument.bind(this);
  newDocumentDocument.onclick = this.newDocument.bind(this);
}

/**
 * Open doclist after login
 */
Doclist.prototype.login = function() {
  loginDiv.visible = false;
  mainDiv.visible = true;
  gadget.draw();
}

/**
* Close doclist after logout
*/
Doclist.prototype.logout = function() {
  loginDiv.visible = true;
  mainDiv.visible = false;  
  gadget.draw();  
}

/**
 * Launch new document
 */
Doclist.prototype.newDocument = function() {
  newDocumentMenu.close();
  if (!framework.system.network.online) {
    errorMessage.display(SERVER_OR_NETWORK_ERROR);
    return;
  }
  if (NEW_DOC[event.srcElement.name]) {
    var winShell = new ActiveXObject("Shell.Application"); 
    winShell.ShellExecute(NEW_DOC[event.srcElement.name]);     
  }
};

/**
 * Open uploader
 */
Doclist.prototype.openUploader = function() {
  this.isUploaderOpen = true;
  this.content = uploaderContent;
  
  sortOptions.visible = false;
  searchArea.visible = false; 
  uploadStatus.visible = true;
  uploaderContent.visible = true;
  doclistContent.visible = false;
  
  this.draw();
  customScrollbar.draw();
}

/**
 * Close uploader
 */
Doclist.prototype.closeUploader = function() {
  if (!this.isUploaderOpen) return;
  this.isUploaderOpen = false;
  this.content = doclistContent;  
  
  sortOptions.visible = true;
  searchArea.visible = true;
  uploadStatus.visible = false; 
  uploaderContent.visible = false;
  doclistContent.visible = true;
  
  this.draw(); 
  customScrollbar.draw(); 
}

/**
 * Draw doclist contents
 */
Doclist.prototype.draw = function() {
	
	// height and vertical position 
	
	var y = 0;
	for (var i=0; i<this.content.children.count; i++) {
    var div = this.content.children.item(i);		
		div.y = y;
		y += div.height;
	}
	
	this.content.height = y;
	
	// show or hide scrollbar
	
	if (this.content.height <= contentContainer.height) {
		this.content.width = contentContainer.width;
		scrollbar.visible = false;			
	} else {
		this.content.width = contentContainer.width - (scrollbar.width + 14);			
		scrollbar.visible = true;
    this.content.height--;
	}
	
	// width and horizontal position
	
	for (var i=0; i<this.content.children.count; i++) {
		var div = this.content.children.item(i);
		div.width = contentContainer.width - (scrollbar.visible ? 0 : 8);			
		
		div.onmousewheel = customScrollbar.wheel.bind(customScrollbar);
		
		if (div.children.count > 0) {
			if (this.isUploaderOpen) {
				this.drawUploader(div);				
			} else {
				this.drawFiles(div);
			}
		}			
	}	
}

/**
 * Draw doclist uploader
 */
Doclist.prototype.drawUploader = function(div) {
	div.children.item(2).width = div.width - div.children.item(2).x;
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
