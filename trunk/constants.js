// Copyright 2007 Google Inc.
// All Rights Reserved.

// @fileoverview Constants used throughout the plugin

var REPORTED_CLIENT_NAME = 'gd-gmail-gadget-' + VERSION_STRING;

var CONNECTION = {
  TIME_BETWEEN_REQUESTS: 1000,
  TIMEOUT: 10000,
  REFRESH_INTERVAL: 300000,

  DEFAULT_DOMAIN: 'gmail.com',
  AUTH_HOST: 'www.google.com',    
  AUTH_URL: 'https://www.google.com/accounts/ClientLogin',
  AUTH_SERVICE: 'writely',
  AUTH_TYPE: 'HOSTED_OR_GOOGLE' 
};

var UI = {
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
  TAB: 9, ENTER: 13, SHIFT: 16, ESCAPE: 27, SPACE: 32,
  HOME: 36, END: 35,
  LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40,
  MENU: 93, SLASH: 191,
  EXCLAMATION_MARK: 33, POUND_SIGN: 35,
  A: 65, C: 67, D: 68, F: 70, G: 71, I: 73, J: 74,
  K: 75, N: 78, O: 79, P: 80, R: 82, S: 83, U: 85, Y: 89,
  PAGE_UP: 33, PAGE_DOWN: 34, F5: 116 
};
