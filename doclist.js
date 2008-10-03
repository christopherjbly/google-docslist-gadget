
/**
 * Constructor for Doclist class.
 */
function Doclist() {
  this.documents = [];
  this.autofill = [];
  this.results = [];
  this.autofillSelected = false;

  this.content = doclistContent;
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
};
