function Document() {
  this.title = '';
  this.link = '';
  this.type = '';
  this.updated = null;
  this.date = '';
  this.starred = false;
}

Document.prototype.getIcon = function() {
  return 'images/icon-' + this.type + '.gif';
};

Document.UNKNOWN = 'unknown';
Document.DOCUMENT = 'document';
Document.SPREADSHEET = 'spreadsheet';
Document.PRESENTATION = 'presentation';
Document.FORM = 'form';

Document.buildNewDocumentUrl = function(type) {
  // TODO: google apps URLs.
  return Document.NEW_DOC_MAP[type];
};

Document.NEW_DOC_MAP = {};
Document.NEW_DOC_MAP[Document.DOCUMENT] = 'http://docs.google.com/MiscCommands?command=newdoc&redirectToDocument=true';
Document.NEW_DOC_MAP[Document.SPREADSHEET] = 'http://spreadsheets.google.com/ccc?new';
Document.NEW_DOC_MAP[Document.PRESENTATION] = 'http://docs.google.com/DocAction?action=new_presentation&source=doclist';
Document.NEW_DOC_MAP[Document.FORM] = 'http://spreadsheets.google.com/newform';

var FILE_EXTENSIONS = {
  'csv': {
    mime: 'text/csv',
    type: Document.SPREADSHEET },
  'doc': {
    mime: 'application/msword',
    type: Document.DOCUMENT },
  'htm': {
    mime: 'text/html',
    type: Document.DOCUMENT },
  'html': {
    mime: 'text/html',
    type: Document.DOCUMENT },
  'ods': {
    mime: 'application/x-vnd.oasis.opendocument.spreadsheet',
    type: Document.SPREADSHEET },
  'odt': {
    mime: 'application/vnd.oasis.opendocument.text',
    type: Document.DOCUMENT },
  'pdf': {
    mime: 'application/pdf',
    type: Document.DOCUMENT },
  'pps': {
    mime: 'application/vnd.ms-powerpoint',
    type: Document.PRESENTATION },
  'ppt': {
    mime: 'application/vnd.ms-powerpoint',
    type: Document.PRESENTATION },
  'rtf': {
    mime: 'application/rtf',
    type: Document.DOCUMENT },
  'sxw': {
    mime: 'application/vnd.sun.xml.writer',
    type: Document.DOCUMENT },
  'tab': {
    mime: 'text/tab-separated-values',
    type: Document.SPREADSHEET },
  'txt': {
    mime: 'text/plain',
    type: Document.DOCUMENT },
  'tsv': {
    mime: 'text/tab-separated-values',
    type: Document.SPREADSHEET },
  'xls': {
    mime: 'application/vnd.ms-excel',
    type: Document.SPREADSHEET }
};

