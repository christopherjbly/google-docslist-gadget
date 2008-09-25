SortUi.DATE_OPTION = 'date';
SortUi.NAME_OPTION = 'name';

function SortUi(mainDiv) {
  this.mainDiv = mainDiv;
  this.active = SortUi.DATE_OPTION;

  this.nameColumn = child(this.mainDiv, 'sortOptionsName');
  this.nameArrow = child(this.nameColumn, 'sortOptionsNameArrow');
  this.nameDateDivider = child(this.mainDiv, 'sortOptionsNameDateDivider');
  this.dateNameDivider = child(this.mainDiv, 'sortOptionsDateNameDivider');
  this.dateColumn = child(this.mainDiv, 'sortOptionsDate');
  this.dateArrow = child(this.dateColumn, 'sortOptionsDateArrow');

  this.nameColumn.onclick = this.name.bind(this);
  this.dateColumn.onclick = this.date.bind(this);

  this.date();
}

SortUi.prototype.name = function() {
  if (this.active == SortUi.NAME_OPTION) {
    return;
  }
  this.active = SortUi.NAME_OPTION;
  /*
  options.putValue('sort', this.active);
  */
  this.draw();

  if (this.onChange) {
    this.onChange();
  }
};

SortUi.prototype.date = function() {
  if (this.active == SortUi.DATE_OPTION) {
    return;
  }
  this.active = SortUi.DATE_OPTION;
  /*
  options.putValue('sort', this.active);
  */
  this.draw();

  if (this.onChange) {
    this.onChange();
  }
};

SortUi.INACTIVE_BG = 'images/inactive-bg.gif';
SortUi.ACTIVE_BG = 'images/active-bg.gif';

SortUi.prototype.draw = function() {
  this.mainDiv.width = mainDiv.width - 6;
  this.mainDiv.x = 2;

  this.nameColumn.width = Math.ceil((2/3) * this.mainDiv.width);
  if (scrollbar.visible && this.dateColumn.width < UI.MIN_DATE_WIDTH) {
    this.nameColumn.width = this.mainDiv.width - UI.MIN_DATE_WIDTH;
    this.dateColumn.width = UI.MIN_DATE_WIDTH;
  }
  this.nameDateDivider.x = this.nameColumn.width;
  this.dateNameDivider.x = this.nameColumn.width;

  this.dateColumn.x = this.nameDateDivider.width + this.nameDateDivider.x;
  this.dateColumn.width = this.mainDiv.width -
      (this.nameColumn.width + this.nameDateDivider.width);

  this.nameArrow.x = this.nameColumn.width - (this.nameArrow.width + 5);
  this.dateArrow.x = this.dateColumn.width - (this.dateArrow.width + 5);

  if (this.active == SortUi.DATE_OPTION) {
    this.dateColumn.background = SortUi.ACTIVE_BG ;
    this.nameColumn.background = SortUi.INACTIVE_BG;

    this.nameColumn.cursor = 'hand';
    this.dateColumn.cursor = 'arrow';
    this.nameDateDivider.visible = true;
    this.dateNameDivider.visible = false;
    this.nameArrow.visible = false;
    this.dateArrow.visible = true;
  } else {
    this.dateColumn.background = SortUi.INACTIVE_BG;
    this.nameColumn.background = SortUi.ACTIVE_BG;

    this.nameColumn.cursor = 'arrow';
    this.dateColumn.cursor = 'hand';
    this.nameDateDivider.visible = false;
    this.dateNameDivider.visible = true;
    this.nameArrow.visible = true;
    this.dateArrow.visible = false;
  }
};
