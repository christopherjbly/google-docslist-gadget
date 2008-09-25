// Copyright 2008 Google Inc.
// All Rights Reserved.

function LoginUi() {
  this.onLogin = null;

  this.mainDiv = loginDiv;

  this.userField = child(this.mainDiv, 'user');
  this.userField.onkeypress = this.onUserKeyPress.bind(this);

  this.passwordField = child(this.mainDiv, 'pass');
  this.passwordField.onkeypress = this.onPasswordKeyPress.bind(this);

  this.loginButton = child(this.mainDiv, 'login');
  this.loginButton.onkeypress = this.onLoginKeyPress.bind(this);
  this.loginButton.onfocusin = this.onLoginFocus.bind(this, true);
  this.loginButton.onfocusout = this.onLoginFocus.bind(this, false);

  this.rememberCheck = child(this.mainDiv, 'remember');
  this.rememberCheck.onchange = this.onRememberFocus.bind(this, true);
  this.rememberCheck.onkeypress = this.onRememberKeyPress.bind(this);
  this.rememberCheck.onfocusin = this.onRememberFocus.bind(this, true);
  this.rememberCheck.onfocusout = this.onRememberFocus.bind(this, false);

  this.rememberCheckFocus = child(this.mainDiv, 'rememberFocus');

  this.reset();
}

LoginUi.prototype.reset = function() {
  this.userField.value = '';
  this.passwordField.value = '';
  this.rememberCheck.value = false;
};

LoginUi.prototype.onUserKeyPress = function() {
  if (event.keycode == KEYS.ENTER) {
    if (!this.passwordField.value) {
      this.passwordField.focus();
    } else {
      this.login();
    }
    event.returnValue = false;
  }
};

LoginUi.prototype.onPasswordKeyPress = function() {
  if (event.keycode == KEYS.ENTER) {
    if (!this.userField.value) {
      this.userField.focus();
    } else {
      this.login();
    }
    event.returnValue = false;
  }
};

LoginUi.prototype.onRememberKeyPress = function() {
  if (event.keycode == KEYS.ENTER ||
      event.keycode == KEYS.SPACE) {
    this.rememberCheck.value = !this.rememberCheck.value;
    this.onRememberFocus(true);
  }
};

LoginUi.prototype.onLoginKeyPress = function() {
  if (event.keycode == KEYS.ENTER ||
      event.keycode == KEYS.SPACE) {
    if (!this.userField.value) {
      this.userField.focus();
    } else {
      this.login();
    }
  }
};

LoginUi.prototype.onRememberFocus = function(got) {
  this.rememberCheckFocus.visible = got;
};

LoginUi.prototype.onLoginFocus = function(got) {
  this.loginButton.image = got ?
      'images/action_hover.png' :
      'images/action_default.png';
};

var loginUi = new LoginUi();
