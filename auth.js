Auth.LOGIN_ERRORS = {
  'BadAuthentication': ERROR_BAD_AUTH,
  'NotVerified': ERROR_NOT_VERIFIED,
  'TermsNotAgreed': ERROR_TERMS,
  'CaptchaRequired': ERROR_CAPTCHA,
  'Unknown': ERROR_UNKNOWN,
  'AccountDeleted': ERROR_ACCOUNT_DELETED,
  'AccountDisabled': ERROR_ACCOUNT_DISABLED,
  'ServiceDisabled': ERROR_SERVICE_DISABLED,
  'ServiceUnavailable': ERROR_SERVICE_UNAVAILABLE };

function Auth() {
  options.putDefaultValue(Auth.OPTIONS_KEY_TOKEN, '');
  options.putDefaultValue(Auth.OPTIONS_KEY_USERNAME, '');

  this.token = this.getStoredToken();
  this.username = this.getStoredUsername();
  this.sid = '';
  this.lsid = '';
}

Auth.OPTIONS_KEY_TOKEN = 'token';
Auth.OPTIONS_KEY_USERNAME = 'username';

Auth.prototype.getStoredToken = function() {
  options.getValue(Auth.OPTIONS_KEY_TOKEN);
};

Auth.prototype.setStoredToken = function(token) {
  options.putValue(Auth.OPTIONS_KEY_TOKEN, token);
  options.encryptValue(Auth.OPTIONS_KEY_TOKEN);
};

Auth.prototype.getStoredUsername = function() {
  options.getValue(Auth.OPTIONS_KEY_USERNAME);
};

Auth.prototype.setStoredUsername = function(username) {
  options.putValue(Auth.OPTIONS_KEY_USERNAME, username);
  options.encryptValue(Auth.OPTIONS_KEY_USERNAME);
};

Auth.DEFAULT_DOMAIN = 'gmail.com';
Auth.URL = 'https://www.google.com/accounts/ClientLogin';
Auth.SERVICE = 'writely';
Auth.TYPE = 'HOSTED_OR_GOOGLE';

Auth.prototype.login = function(user, pass, isRemember, onSuccess, onFailure) {
  var passValue = pass;
  var userValue = user.indexOf('@') == -1 ?
      user + '@' + Auth.DEFAULT_DOMAIN :
      user;

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
  this.setStoredToken('');
  this.setStoredUsername('');
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
