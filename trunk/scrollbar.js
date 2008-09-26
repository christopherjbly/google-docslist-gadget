/**
 * Constructor for CustomScrollbar class.
 */
function CustomScrollbar(mainDiv) {
  this.mainDiv = mainDiv;
  this.bar = child(this.mainDiv, 'scrollbarBar');
  this.track = child(this.mainDiv, 'scrollbarTrack');
  this.up = child(this.mainDiv, 'scrollbarUp');
  this.down = child(this.mainDiv, 'scrollbarDown');

  this.halt = {};

  this.bar.onmousedown = this.startBar.bind(this);
  this.bar.onmousemove = this.dragBar.bind(this);
  this.bar.onmouseup = this.endBar.bind(this);
  this.track.onclick = this.track.bind(this);

  this.up.onmousedown = this.startUp.bind(this);
  this.down.onmousedown = this.startDown.bind(this);
  this.up.onmouseup = this.endUp.bind(this);
  this.down.onmouseup = this.endDown.bind(this);

  view.onmousewheel = this.wheel.bind(this);
  window.onkeydown = this.keydown.bind(this);
  window.onkeyup = this.keyup.bind(this);
}

/**
 * Keyboard controls on keydown
 */
CustomScrollbar.prototype.keydown = function() {
  switch(event.keycode) {

    case KEYS.UP:
      this.startUp();
      break;

    case KEYS.DOWN:
      this.startDown();
      break;

    case KEYS.PAGE_UP:
      this.scrollPageUp();
      break;

    case KEYS.PAGE_DOWN:
      this.scrollPageDown();
      break;

    case KEYS.HOME:
      this.scrollTop();
      break;

    case KEYS.END:
      this.scrollBottom();
      break;
  }
};

/**
 * Shortcut functions
 */
CustomScrollbar.prototype.scrollBottom = function() {  
  if (this.mainDiv.visible) {
    this.bar.y = this.max();
    this.scroll();            
  }
};

CustomScrollbar.prototype.scrollTop = function() {    
  if (this.mainDiv.visible) {  
    this.bar.y = this.min();
    this.scroll();  
  }
};

CustomScrollbar.prototype.scrollPageDown = function() {  
  if (this.mainDiv.visible) {    
    this.moveBar(this.bar.height);
  }
};

CustomScrollbar.prototype.scrollPageUp = function() {    
  if (this.mainDiv.visible) {    
    this.moveBar(-this.bar.height);
  }
};

/**
 * Keyboard controls on keyup
 */
CustomScrollbar.prototype.keyup = function() {    
  switch(event.keycode) {      

    case KEYS.UP:
      this.endUp();
      break;
      
    case KEYS.DOWN:
      this.endDown();
      break;
  }
};


/**
 * Mouse wheel
 */
CustomScrollbar.prototype.wheel = function() {    
  if (this.halt.wheel) {
    return;
  }
  this.halt.wheel = true;
    
  if (event.wheelDelta > 0) {
    this.startUp();
    
    var time = 100 * (Math.abs(event.wheelDelta) / 360);    
    view.setTimeout(function() {
      this.endUp();
      this.halt.wheel = false;
    }.bind(this), time);
  } else if (event.wheelDelta < 0) {
    this.startDown();
    
    time = 100 * (Math.abs(event.wheelDelta) / 360);          
    view.setTimeout(function() {
      this.endDown();
      this.halt.wheel = false;      
    }.bind(this), time);    
  }
};

/**
 * Scroll button up
 */
CustomScrollbar.prototype.startUp = function() {    
  var time = (this.bar.height && this.track.height) ? 100 / (this.bar.height / this.track.height) : 100;
  
  this.up = view.beginAnimation(function() {
    this.bar.y = event.value;
    this.scroll();
  }.bind(this), this.bar.y, this.min(), time * this.ratio());
};

/**
 * Scroll button down
 */
CustomScrollbar.prototype.startDown = function() {  
  var time = (this.bar.height && this.track.height) ? 100 / (this.bar.height / this.track.height) : 100;
  
  this.down = view.beginAnimation(function() {
    this.bar.y = event.value;
    this.scroll();    
  }.bind(this), this.bar.y, this.max(), time * (1 - this.ratio()));
};

/**
 * End scroll button up
 */
CustomScrollbar.prototype.endUp = function() {    
  view.cancelAnimation(this.up);
};

/**
 * End scroll button down
 */
CustomScrollbar.prototype.endDown = function() {    
  view.cancelAnimation(this.down);
};

/**
 * Start scrollbar move
 */
CustomScrollbar.prototype.startBar = function() {   
  this.halt.drag = true;
  this.start = event.y;
};

/**
 * End scrollbar move
 */
CustomScrollbar.prototype.endBar = function() {   
  this.halt.drag = false;
};

/**
 * Compute min value of y
 */
CustomScrollbar.prototype.min = function() {    
  return this.up.height;
};

/**
 * Compute max value of y
 */
CustomScrollbar.prototype.max = function() {    
  return (this.track.height - (this.bar.height - this.up.height + 1));
};

/**
 * Compute scroll ratio
 */
CustomScrollbar.prototype.ratio = function() {    
  if (this.max() == this.min()) {
    return 0;
  }
  return (this.bar.y - this.min()) / (this.max() - this.min());
};

/**
 * Scroll content area
 */
CustomScrollbar.prototype.scroll = function() { 
  var maxY = doclist.content.height - contentContainer.height;
  if (maxY < 0) {
    maxY = 0;
  }

  var newY = maxY * this.ratio(); 
  
  if (newY > maxY) {
    doclist.content.y = -maxY;
  } else {
    doclist.content.y = -newY;
  }
};

/**
 * Handle clicked track
 */
CustomScrollbar.prototype.track = function() {      
  var min = this.min();
  var max = this.max();

  if (event.y < min) {
    this.bar.y = min;
  } else if (event.y > max) {
    this.bar.y = max;
  } else {
    this.bar.y = event.y;
  }

  this.scroll();
};

/**
 * Move scrollbar
 */
CustomScrollbar.prototype.moveBar = function(moveY) {    
  var y = moveY;

  var min = this.min();
  var max = this.max();

  if (y < 0) {
    if (this.bar.y > min) {
      this.bar.y = (this.bar.y + y > min) ? this.bar.y + y : min;
    }
  }
  else if (y > 0) {
    if (this.bar.y < max) {
        this.bar.y = (this.bar.y + y > max) ? max : this.bar.y + y;
    }
  }

  this.scroll();
};

/**
 * Drag scrollbar
 */
CustomScrollbar.prototype.dragBar = function() {
  if (!this.halt.drag) {
    return;
  }
  this.halt.drag = false;

  this.moveBar(event.y - this.start);

  this.halt.drag = true;
};

/**
 * Draw scrollbar
 */
CustomScrollbar.prototype.draw = function() {
  var scrollRatio = this.track.height ? ((this.bar.y - this.up.height) / (this.track.height)) : 0;

  this.mainDiv.x = doclist.content.width + 9;
  this.mainDiv.height = contentContainer.height - 5;

  this.down.y = this.mainDiv.height - this.down.height;
  this.track.height = this.mainDiv.height - (this.down.height + this.up.height);

  if (doclist.content.height === 0) {
    this.bar.height = this.track.height - 1;
  } else {
    var newHeight = Math.ceil(this.track.height * (contentContainer.height / doclist.content.height));
    if (newHeight < 10) {
      newHeight = 10;
    }
    this.bar.height = newHeight >= this.track.height ? this.track.height - 1 : newHeight;
  }

  var newY = scrollRatio * this.track.height + this.up.height;

  if (newY < this.min()) {
      this.bar.y = this.min();
  } else if (newY > this.max()) {
      this.bar.y = this.max();
  } else {
    this.bar.y = newY;
  }

  this.scroll();
};
