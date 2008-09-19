// Copyright 2007 Google Inc.
// All Rights Reserved.

// @fileoverview Constants used throughout the plugin

var REPORTED_CLIENT_NAME = 'gd-docslist-gadget-' + VERSION_STRING;

var CONNECTION = {
  TIME_BETWEEN_REQUESTS: 1000,
  TIMEOUT: 10000,
  REFRESH_INTERVAL: 60000, // 60 seconds

  DEFAULT_DOMAIN: 'gmail.com',
  AUTH_HOST: 'www.google.com',    
  AUTH_URL: 'https://www.google.com/accounts/ClientLogin',
  AUTH_SERVICE: 'writely',
  AUTH_TYPE: 'HOSTED_OR_GOOGLE',  
  DOCS_HOST: 'docs.google.com',  
  DOCS_URL: 'http://docs.google.com/feeds/documents/private/full'
};

var UI = {
  MIN_WIDTH: 210,
  MIN_HEIGHT: 200,  
  MIN_DATE_WIDTH: 85,
  ERROR_MESSAGE_TIMEOUT: 3000
};

var NEW_DOC = {
  'newDocumentDocument': 'http://docs.google.com/MiscCommands?command=newdoc&redirectToDocument=true&hl=en',
  'newDocumentSpreadsheet': 'http://spreadsheets.google.com/ccc?new&hl=en',
  'newDocumentPresentation': 'http://docs.google.com/DocAction?action=new_presentation&source=doclist&hl=en',
  'newDocumentForm': 'http://spreadsheets.google.com/newform?hl=en'
};

var LOGIN_ERRORS = {
  'BadAuthentication': ERROR_BAD_AUTH,
  'NotVerified': ERROR_NOT_VERIFIED,
  'TermsNotAgreed': ERROR_TERMS,
  'CaptchaRequired': ERROR_CAPTCHA,
  'Unknown': ERROR_UNKNOWN,
  'AccountDeleted': ERROR_ACCOUNT_DELETED,
  'AccountDisabled': ERROR_ACCOUNT_DISABLED,
  'ServiceDisabled': ERROR_SERVICE_DISABLED,
  'ServiceUnavailable': ERROR_SERVICE_UNAVAILABLE
};

var KEYS = {
  ENTER: 13, 
  SPACE: 32,
  UP: 38, 
  DOWN: 40, 
  PAGE_UP: 33, 
  PAGE_DOWN: 34,
  HOME: 36, 
  END: 35
};
