/**
 * Constructor for SortOptions class.
 */
function SortOptions() {
  this.active = "date";
  sortOptionsName.onclick = this.name.bind(this);
  sortOptionsDate.onclick = this.date.bind(this);

  switch (options.getValue('sort')) {
    case 'name':
      this.name(true);
      break;
    case 'date':
      this.date(true);
      break;
    default:
      this.date(true);
  }
}

/**
 * Switch to sort by name
 */
SortOptions.prototype.name = function(init) {
  if (this.active == "name") {
    return;
  }
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

  if (!init) {
    doclist.sort();
  }
};

/**
 * Switch to sort by date
 */
SortOptions.prototype.date = function(init) {
  if (this.active == "date") {
    return;
  }
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

  if (!init) {
    doclist.sort();
  }
};

/**
 * Draw sort options
 */
SortOptions.prototype.draw = function() {
  sortOptionsArea.width = mainDiv.width - 6;
  sortOptionsArea.x = 2;

  sortOptionsName.width = Math.ceil((2/3) * sortOptionsArea.width);
  if (scrollbar.visible && sortOptionsDate.width < UI.MIN_DATE_WIDTH) {
    sortOptionsName.width = sortOptionsArea.width - UI.MIN_DATE_WIDTH;
    sortOptionsDate.width = UI.MIN_DATE_WIDTH;
  }
  sortOptionsNameDateDivider.x = sortOptionsName.width;
  sortOptionsDateNameDivider.x = sortOptionsName.width;

  sortOptionsDate.x = sortOptionsNameDateDivider.width + sortOptionsNameDateDivider.x;
  sortOptionsDate.width = sortOptionsArea.width - (sortOptionsName.width + sortOptionsNameDateDivider.width);

  sortOptionsNameArrow.x = sortOptionsName.width - (sortOptionsNameArrow.width + 5);
  sortOptionsDateArrow.x = sortOptionsDate.width - (sortOptionsDateArrow.width + 5);
};

// instantiate object in the global scope
var sortOptions = new SortOptions();
