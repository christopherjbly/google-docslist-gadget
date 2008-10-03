// Copyright 2008 Google Inc.
// All Rights Reserved.

// @fileoverview Constants used throughout the gadget.

var REPORTED_CLIENT_NAME = 'gd-docslist-gadget-' + strings.VERSION_STRING;

// TODO: move these to files.

var UI = {
  MIN_WIDTH: 170,
  MIN_HEIGHT: 200,
  MIN_DATE_WIDTH: 85,
  MAX_AUTOFILL: 5,
  ERROR_MESSAGE_TIMEOUT: 3000 };

var UPLOAD_STATUS = {
  WAITING: false,
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error' };

var FILE_TYPES = {
  'doc': 'document',
  'dot': 'document',
  'pdf': 'document',
  'xls': 'spreadsheet',
  'xlb': 'spreadsheet',
  'xlt': 'spreadsheet',
  'csv': 'document',
  'wks': 'spreadsheet',
  '123': 'spreadsheet',
  'ppt': 'presentation',
  'pps': 'presentation',
  'prc': 'presentation',
  'htm': 'document',
  'html': 'document',
  'rtf': 'document' };

var MIME_TYPES = {
  'csv': 'text/csv',
  'doc': 'application/msword',
  'htm': 'text/html',
  'html': 'text/html',
  'ods': 'application/x-vnd.oasis.opendocument.spreadsheet',
  'odt': 'application/vnd.oasis.opendocument.text',
  'pdf': 'application/pdf',
  'pps': 'application/vnd.ms-powerpoint',
  'ppt': 'application/vnd.ms-powerpoint',
  'rtf': 'application/rtf',
  'sxw': 'application/vnd.sun.xml.writer',
  'tab': 'text/tab-separated-values',
  'txt': 'text/plain',
  'tsv': 'text/tab-separated-values',
  'xls': 'application/vnd.ms-excel' };

var UPLOAD_ERRORS = {
  STATUS_415: ERROR_UPLOAD_TYPE,
  STATUS_401: ERROR_UPLOAD_EXPIRED,
  STATUS_0: ERROR_UPLOAD_NETWORK,
  CORRUPT: ERROR_UPLOAD_CORRUPT };

var KEYS = {
  ENTER: 13,
  ESCAPE: 27,
  SPACE: 32,
  UP: 38,
  DOWN: 40,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  HOME: 36,
  END: 35 };
