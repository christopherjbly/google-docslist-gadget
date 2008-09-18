// bind function
Function.prototype.bind = function(context) {
  var __method = this;
  return function() {
    return __method.apply(context, arguments);
  };
};

// generate query string for POST
Object.prototype.toQueryString = function() {
  var str = [];
  for (var key in this) {
    var type = typeof this[key];
    if (type == 'boolean' || type == 'number' || type == 'string') {
      str.push(key + '=' + encodeURIComponent(this[key].toString()));
    }
  }
  return str.join('&');
}

// Strips whitespace from beginning and end of string
String.prototype.trim = function()
{
  return this.replace(/^\s*|\s*$/g,'');
}

// Calculate the width of a label
function labelCalcWidth(ele) { 
  try {
    var edit = labelCalcHelper;
  } catch(e) {
    var edit = view.appendElement('<edit name="labelCalcHelper" />');
  }

  edit.visible = false; 
  edit.y = 2000; 
  edit.x = 0; 
  edit.width = 1000; 
  edit.height = 30; 
  edit.value = ele.innerText; 
  edit.font = ele.font; 
  edit.size = ele.size; 
  edit.bold = ele.bold; 
  edit.italic = ele.italic; 
  edit.underline = ele.underline; 
  var idealRect = edit.idealBoundingRect; 
  edit.width = idealRect.width; 
  edit.height = idealRect.height; 
  return idealRect.width; 
} 
