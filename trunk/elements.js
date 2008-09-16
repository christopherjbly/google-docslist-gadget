/**
 * Constructor for SearchField class.
 */
function SearchField() {
	var self = this;
	this.defaultValue = search.value;
	this.defaultColor = search.color;
	
	search.onfocusin = function() { self.activate(); }
	search.onclick = function() { self.activate(); }

	search.onfocusout = function() { if (!search.value.trim()) self.reset(); }	
	search.onchange = function() { self.autofill(); }	
	searchClear.onclick = function() { self.reset(); }	
}

/**
 * Draw autofill
 */
SearchField.prototype.draw = function() {
	autoFill.width = searchArea.width + (autoFillTopRight.width + 1);
	autoFillTopCenter.width = autoFill.width - (autoFillTopLeft.width + autoFillTopRight.width);
	autoFillOptions.width = autoFillTopCenter.width;
	autoFillBottomCenter.width = autoFillTopCenter.width;
	
	autoFillTopRight.x = autoFillTopCenter.x + autoFillTopCenter.width;
	autoFillMiddleRight.x = autoFillTopRight.x;
	autoFillBottomRight.x = autoFillTopRight.x;

	var y = 0;
	for (var i=0; i<autoFillOptions.children.count; i++) {
		var div = autoFillOptions.children.item(i);
		div.width = autoFillOptions.width;
		div.y = y;
		y += div.height;
		
		if (div.children.count == 2) {			
			div.children.item(1).width = autoFillOptions.width - div.children.item(1).x - 5;
		}
	}
}

/**
 * Activate search field
 */
SearchField.prototype.activate = function() {
	if (search.value != this.defaultValue) return;
	search.value = '';
	search.color = '#000000';
	searchClear.visible = true;
}

/**
 * Reset search field
 */
SearchField.prototype.reset = function() {
	search.value = this.defaultValue;
	search.color = this.defaultColor;
	searchClear.visible = false;
	autoFill.visible = false;
}

/**
 * Fill in autofill popdown
 */
SearchField.prototype.autofill = function() {
	if (!search.value.trim()) {
		autoFill.visible = false;		
		return;
	}
	
	this.draw();
	autoFill.visible = true;
}

// instantiate object in the global scope
var searchField = new SearchField();


/**
 * Constructor for SortOptions class.
 */
function SortOptions() {
	var self = this;
	this.active = "date";
	sortOptionsName.onclick = function() { self.name(); }
	sortOptionsDate.onclick = function() { self.date(); }	
}

/**
 * Switch to sort by name
 */
SortOptions.prototype.name = function() {
	if (this.active == "name") return;	
	this.active = "name";
	
	var background = sortOptionsName.background;
	sortOptionsName.background = sortOptionsDate.background;
	sortOptionsDate.background = background;
	
	sortOptionsName.cursor = "arrow";
	sortOptionsDate.cursor = "hand";
	sortOptionsNameDateDivider.visible = "false";
	sortOptionsDateNameDivider.visible = "true";
	
	sortOptionsNameArrow.visible = true;			
	sortOptionsDateArrow.visible = false;
}

/**
 * Switch to sort by date
 */
SortOptions.prototype.date = function() {
	if (this.active == "date") return;	
	this.active = "date";	
	
	var background = sortOptionsDate.background;
	sortOptionsDate.background = sortOptionsName.background;
	sortOptionsName.background = background;
	sortOptionsNameDateDivider.visible = "true";
	sortOptionsDateNameDivider.visible = "false";
	
	sortOptionsName.cursor = "hand";
	sortOptionsDate.cursor = "arrow";
	
	sortOptionsNameArrow.visible = false;		
	sortOptionsDateArrow.visible = true;
}

// instantiate object in the global scope
var sortOptionsObject = new SortOptions();

/**
 * Constructor for Uploader class.
 */
function Uploader() {
	this.isOpen = false;
	var self = this;
	commandUpload.onclick = function() { self.open(); }	
	uploadOption.onclick = function() { self.close(); }
}

/**
 * Open options box
 */
Uploader.prototype.open = function() {
	this.isOpen = true;
	sortOptions.visible = false;
	searchArea.visible = false;	
	uploadStatus.visible = true;
}

/**
 * Close options box
 */
Uploader.prototype.close = function() {
	if (!this.isOpen) return;
	this.isOpen = false;
	sortOptions.visible = true;
	searchArea.visible = true;
	uploadStatus.visible = false;	
}

// instantiate object in the global scope
var uploader = new Uploader();


/**
 * Constructor for OptionBox class.
 */
function OptionBox() {
	this.isOpen = false;

	var self = this;
	commandsNew.onclick = function() { self.open(); }
	commandsNewArrow.onclick = function() { self.open(); }	
	window.onclick = function() { self.close(); }
}

/**
 * Open options box
 */
OptionBox.prototype.open = function() {
	this.isOpen = true;
	newDocument.visible = true;
}

/**
 * Close options box
 */
OptionBox.prototype.close = function() {
	if (!this.isOpen) return;
	this.isOpen = false;
	newDocument.visible = false;
}

// instantiate object in the global scope
var optionBox = new OptionBox();



/**
 * Constructor for CustomScrollbar class.
 */
function CustomScrollbar() {
	this.halt = {};	
	var self = this;

	scrollbarBar.onmousedown = function() { self.startBar(); }
	scrollbarBar.onmousemove = function() { self.moveBar(); }
	scrollbarBar.onmouseup = function() { self.endBar(); }
	scrollbarTrack.onclick = function() { self.track(); }
	
	scrollbarUp.onmousedown = function() { self.startUp(); }
	scrollbarDown.onmousedown = function() { self.startDown(); }	
	scrollbarUp.onmouseup = function() { self.endUp(); }
	scrollbarDown.onmouseup = function() { self.endDown(); }		
	
	scrollbarTrack.onmousewheel = scrollbarBar.onmousewheel = window.onmousewheel
		= function() { self.wheel(); }
}

/**
 * Mouse wheel
 */
CustomScrollbar.prototype.wheel = function() {		
	if (this.halt.wheel) return;
	this.halt.wheel = true;
	var self = this;
		
	if (event.wheelDelta > 0) {
		this.startUp();
		
		var time = 100 * (Math.abs(event.wheelDelta) / 360);		
		setTimeout(function() {
			self.endUp();
			self.halt.wheel = false;
		}, time);
	} else if (event.wheelDelta < 0) {
		this.startDown();
		
		var time = 100 * (Math.abs(event.wheelDelta) / 360);					
		setTimeout(function() {
			self.endDown();
			self.halt.wheel = false;			
		}, time);		
	}
}

/**
 * Scroll button up
 */
CustomScrollbar.prototype.startUp = function() {		
	var self = this;	
	var time = 100 / (scrollbarBar.height / scrollbarTrack.height);
	
	this.up = view.beginAnimation(function() {
		scrollbarBar.y = event.value;
		self.scroll();
	}, scrollbarBar.y, this.min(), time * this.ratio());
}

/**
 * Scroll button down
 */
CustomScrollbar.prototype.startDown = function() {	
	var self = this;	
	var time = 100 / (scrollbarBar.height / scrollbarTrack.height);		
	
	this.down = view.beginAnimation(function() {
		scrollbarBar.y = event.value;
		self.scroll();		
	}, scrollbarBar.y, this.max(), time * (1 - this.ratio()));
}

/**
 * End scroll button up
 */
CustomScrollbar.prototype.endUp = function() {		
	view.cancelAnimation(this.up);
}

/**
 * End scroll button down
 */
CustomScrollbar.prototype.endDown = function() {		
	view.cancelAnimation(this.down);
}

/**
 * Start scrollbar move
 */
CustomScrollbar.prototype.startBar = function() {		
	this.halt.drag = true;
	this.start = event.y;
}

/**
 * End scrollbar move
 */
CustomScrollbar.prototype.endBar = function() {		
	this.halt.drag = false;
}

/**
 * Compute min value of y
 */
CustomScrollbar.prototype.min = function() {		
	return scrollbarUp.height;
}

/**
 * Compute max value of y
 */
CustomScrollbar.prototype.max = function() {		
	return (scrollbarTrack.height - (scrollbarBar.height - scrollbarUp.height + 1));
}

/**
 * Compute scroll ratio
 */
CustomScrollbar.prototype.ratio = function() {		
	if (this.max() == this.min()) return 0;
	return (scrollbarBar.y - this.min()) / (this.max() - this.min());
}

/**
 * Scroll content area
 */
CustomScrollbar.prototype.scroll = function() {	
	var maxY = content.height - contentContainer.height;
	if (maxY < 0) maxY = 0;

	var newY = maxY * this.ratio();	
	
	if (newY > maxY) content.y = -maxY;
	else content.y = -newY;
}

/**
 * Handle clicked track
 */
CustomScrollbar.prototype.track = function() {			
	var min = this.min();
	var max = this.max();

	if (event.y < min)
		scrollbarBar.y = min;
	else if (event.y > max)
		scrollbarBar.y = max;
	else
		scrollbarBar.y = event.y;
		
	this.scroll();				
}

/**
 * Move scrollbar
 */
CustomScrollbar.prototype.moveBar = function() {		
	if (!this.halt.drag) return;	
	this.halt.drag = false;

	var y = event.y - this.start;

	var min = this.min();
	var max = this.max();

	if (y < 0) {
		if (scrollbarBar.y > min)
				scrollbarBar.y = (scrollbarBar.y + y > min) ? scrollbarBar.y + y : min;
	}
	else if (event.y > 0) {
		if (scrollbarBar.y < max)		
				scrollbarBar.y = (scrollbarBar.y + y > max) ? max : scrollbarBar.y + y;
	}

	this.scroll();		
	this.halt.drag = true;
}

/**
 * Draw scrollbar
 */
CustomScrollbar.prototype.draw = function() {
	
	var scrollRatio = scrollbarTrack.height ? ((scrollbarBar.y - scrollbarUp.height) / (scrollbarTrack.height)) : 0;		

	scrollbar.x = content.width + 9;
	scrollbar.height = contentContainer.height - 5;

	scrollbarDown.y = scrollbar.height - scrollbarDown.height;					
	scrollbarTrack.height = scrollbar.height - (scrollbarDown.height + scrollbarUp.height);
	
	var newHeight = Math.ceil(scrollbarTrack.height * (contentContainer.height / content.height));
	if (newHeight < 10) newHeight = 10;
	scrollbarBar.height = newHeight >= scrollbarTrack.height ? scrollbarTrack.height - 1 : newHeight;
	
	var newY = scrollRatio * scrollbarTrack.height + scrollbarUp.height;
	
	if (newY < this.min())
			scrollbarBar.y = this.min();
	else if (newY > this.max())
			scrollbarBar.y = this.max();
	else
		scrollbarBar.y = newY;	
		
	this.scroll();				
}

// instantiate object in the global scope
var customScrollbar = new CustomScrollbar();
