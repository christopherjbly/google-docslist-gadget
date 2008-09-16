
// Strips whitespace from beginning and end of string
String.prototype.trim = function()
{
    return this.replace(/^\s*|\s*$/g,'');
}

// Calculate the width of a label
function labelCalcWidth(ele) { 
        var edit = view.appendElement("<edit />"); 
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
        view.removeElement(edit); 
        return idealRect.width; 
} 
