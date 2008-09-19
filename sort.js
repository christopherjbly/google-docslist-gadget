/**
 * Constructor for SortOptions class.
 */
function SortOptions() {
  this.active = "date";
  sortOptionsName.onclick = this.name.bind(this);
  sortOptionsDate.onclick = this.date.bind(this);
  
  switch (options.getValue('sort')) {
    case 'name': this.name(true); break;
    case 'date': this.date(true); break;
  }
}

/**
 * Switch to sort by name
 */
SortOptions.prototype.name = function(init) {
  if (this.active == "name") return;  
  this.active = "name";
  options.putValue('sort', this.active);
  
  var background = sortOptionsName.background;
  sortOptionsName.background = sortOptionsDate.background;
  sortOptionsDate.background = background;
  
  sortOptionsName.cursor = "arrow";
  sortOptionsDate.cursor = "hand";
  sortOptionsNameDateDivider.visible = "false";
  sortOptionsDateNameDivider.visible = "true";
  
  sortOptionsNameArrow.visible = true;      
  sortOptionsDateArrow.visible = false;
  
  if (!init) doclist.sort();
}

/**
 * Switch to sort by date
 */
SortOptions.prototype.date = function(init) {
  if (this.active == "date") return;  
  this.active = "date"; 
  options.putValue('sort', this.active);
  
  var background = sortOptionsDate.background;
  sortOptionsDate.background = sortOptionsName.background;
  sortOptionsName.background = background;
  sortOptionsNameDateDivider.visible = "true";
  sortOptionsDateNameDivider.visible = "false";
  
  sortOptionsName.cursor = "hand";
  sortOptionsDate.cursor = "arrow";
  
  sortOptionsNameArrow.visible = false;   
  sortOptionsDateArrow.visible = true;

  if (!init) doclist.sort();
}

// instantiate object in the global scope
var sortOptions = new SortOptions();
