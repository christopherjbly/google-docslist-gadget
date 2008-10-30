Auth.LOGIN_ERRORS = {
  'BadAuthentication': strings.ERROR_BAD_AUTH,
  'NotVerified': strings.ERROR_NOT_VERIFIED,
  'TermsNotAgreed': strings.ERROR_TERMS,
  'CaptchaRequired': strings.ERROR_CAPTCHA,
  'Unknown': strings.ERROR_UNKNOWN,
  'AccountDeleted': strings.ERROR_ACCOUNT_DELETED,
  'AccountDisabled': strings.ERROR_ACCOUNT_DISABLED,
  'ServiceDisabled': strings.ERROR_SERVICE_DISABLED,
  'ServiceUnavailable': strings.ERROR_SERVICE_UNAVAILABLE };

function Auth() {
  options.putDefaultValue(Auth.OPTIONS_KEY_TOKEN, '');
  options.putDefaultValue(Auth.OPTIONS_KEY_USERNAME, '');
  options.putDefaultValue(Auth.OPTIONS_KEY_SID, '');
  options.putDefaultValue(Auth.OPTIONS_KEY_LSID, '');

  this.token = this.getStoredToken();
  this.username = this.getStoredUsername();
  this.sid = this.getStoredSid();
  this.lsid = this.getStoredLsid();
  this.appsDomain = '';
}

Auth.OPTIONS_KEY_TOKEN = 'token';
Auth.OPTIONS_KEY_USERNAME = 'username';
Auth.OPTIONS_KEY_SID = 'sid';
Auth.OPTIONS_KEY_LSID = 'lsid';

Auth.prototype.getStoredToken = function() {
  return options.getValue(Auth.OPTIONS_KEY_TOKEN);
};

Auth.prototype.setStoredToken = function(token) {
  options.putValue(Auth.OPTIONS_KEY_TOKEN, token);
  options.encryptValue(Auth.OPTIONS_KEY_TOKEN);
};

Auth.prototype.getStoredUsername = function() {
  return options.getValue(Auth.OPTIONS_KEY_USERNAME);
};

Auth.prototype.setStoredUsername = function(username) {
  options.putValue(Auth.OPTIONS_KEY_USERNAME, username);
  options.encryptValue(Auth.OPTIONS_KEY_USERNAME);
};

Auth.prototype.getStoredSid = function() {
  return options.getValue(Auth.OPTIONS_KEY_SID);
};

Auth.prototype.setStoredSid = function(sid) {
  options.putValue(Auth.OPTIONS_KEY_SID, sid);
  options.encryptValue(Auth.OPTIONS_KEY_SID);
};

Auth.prototype.getStoredLsid = function() {
  return options.getValue(Auth.OPTIONS_KEY_LSID);
};

Auth.prototype.setStoredLsid = function(lsid) {
  options.putValue(Auth.OPTIONS_KEY_LSID, lsid);
  options.encryptValue(Auth.OPTIONS_KEY_LSID);
};

Auth.DEFAULT_DOMAIN = 'gmail.com';
Auth.URL = 'https://www.google.com/accounts/ClientLogin';
Auth.SERVICE = 'writely';
Auth.TYPE = 'HOSTED_OR_GOOGLE';

Auth.prototype.login = function(user, pass, isRemember, onSuccess, onFailure) {
  var passValue = pass;
  var userValue = user;

  if (userValue.indexOf('@') == -1) {
    userValue = userValue + '@' + Auth.DEFAULT_DOMAIN;
  } else {
    this.appsDomain = userValue.substr(userValue.indexOf('@') + 1);
  }

  var defaultDomainIndex = userValue.indexOf('@' + Auth.DEFAULT_DOMAIN);
  this.username = defaultDomainIndex == -1 ?
      userValue :
      userValue.substr(0, defaultDomainIndex);

  var params = { 'Email': userValue,
                 'Passwd': passValue,
                 'service': Auth.SERVICE,
                 'source': REPORTED_CLIENT_NAME,
                 'accountType': Auth.TYPE };
  var data = buildQueryString(params);

  g_httpRequest.connect(Auth.URL, data,
      this.onLoginSuccess.bind(this, user, isRemember, onSuccess),
      this.onLoginError.bind(this, onFailure));
};

Auth.prototype.clear = function() {
  this.username = '';
  this.token = '';
  this.sid = '';
  this.lsid = '';
  this.appsDomain = '';
  this.setStoredToken('');
  this.setStoredUsername('');
  this.setStoredSid('');
  this.setStoredLsid('');
};

Auth.prototype.parseResponse = function(response) {
  var responseLines = response.split('\n');
  var responseData = {};
  for (var i = 0; i < responseLines.length; ++i) {
    var split = responseLines[i].indexOf('=');
    var key = responseLines[i].substr(0, split);
    var value = responseLines[i].substr(split + 1);
    responseData[key] = value;
  }

  return responseData;
};

Auth.prototype.onLoginSuccess = function(response,
    user, isRemember, onSuccess) {
  var responseData = this.parseResponse(response);

  this.token = responseData['Auth'];
  this.sid = responseData['SID'];
  this.lsid = responseData['LSID'];

  if (isRemember) {
    this.setStoredToken(this.token);
    this.setStoredUsername(user);
    /*
    this.setStoredSid(this.sid);
    this.setStoredLsid(this.lsid);
    */
  }

  onSuccess();
};

Auth.prototype.onLoginError = function(status, response, onFailure) {
  this.clear();

  var error = 'Unknown';

  if (status == 403) {
    var responseData = this.parseResponse(response);
    error = responseData['Error'] || error;
  }

  onFailure(error, Auth.LOGIN_ERRORS[error]);
};

Auth.prototype.hasCredentials = function() {
  return this.token && this.username;
};

Auth.ISSUE_AUTH_TOKEN_URL = 'https://www.google.com/accounts/IssueAuthToken';
Auth.TOKEN_AUTH_URL = 'https://www.google.com/accounts/TokenAuth';

Auth.prototype.tryOpenUrlTokenAuth = function(url) {
  // TODO: doesn't seem to work.
  if (true) {
    framework.openUrl(url);
    return;
  }

  if (!this.sid || !this.lsid) {
    framework.openUrl(url);
    return;
  }

  var params = { 'SID': this.sid,
                 'LSID': this.lsid,
                 'service': Auth.SERVICE,
                 'Session': false };
  var data = buildQueryString(params);

  g_httpRequest.connect(Auth.ISSUE_AUTH_TOKEN_URL, data,
      this.onTokenAuthSuccess.bind(this, url),
      this.onTokenAuthError.bind(this, url));
};

Auth.prototype.buildTokenAuthUrl = function(token, url) {
  var params = { 'auth': token,
                 'source': REPORTED_CLIENT_NAME,
                 'service': Auth.SERVICE,
                 'continue': url };
  var data = buildQueryString(params);

  return Auth.TOKEN_AUTH_URL + '?' + data;
};

Auth.prototype.onTokenAuthSuccess = function(response, url) {
  framework.openUrl(this.buildTokenAuthUrl(response, url));
};

Auth.prototype.onTokenAuthError = function(status, response, url) {
  debug.warning('Could not get auth token.');
  framework.openUrl(url);
};
