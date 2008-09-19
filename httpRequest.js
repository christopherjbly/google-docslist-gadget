// Copyright 2007 Google Inc.
// All Rights Reserved.

// @fileoverview Functions for server communications through XMLHttpRequest

function createXhr() {
  var xhr;

  try {
    xhr = framework.google.betaXmlHttpRequest();
  } catch (e) {
    xhr = new XMLHttpRequest();
  }

  return xhr;
}

var httpRequest = new HTTPRequest();

function HTTPRequest() {
  this.packet = new createXhr();
  this.handler = null;
  this.failedHandler = null;
  // Token for timeout timer.
  this.timeoutTimer = null;
}

HTTPRequest.available = true;
HTTPRequest.queue = [];

/**
 * Function used to allow a time between httpRequests, so as not to clutter
 * the servers. This function is static since all requests in the gadget are
 * made to the same server and thus must handle all objects of the class type
 */
HTTPRequest.finishedGracePeriod = function() {
  HTTPRequest.available = true;
  if (HTTPRequest.queue.length > 0) {
    var request = HTTPRequest.queue.shift();
    request.requestObject.connect(request.data, request.handler, request.failedHandler);
  }
};

/**
 * Sends out a request using XMLHttpRequest
 * @param {String} data The data to be packed
 */
HTTPRequest.prototype.connect = function (data, handler, failedHandler) {
  
  if (!HTTPRequest.available) {
    // The server fails to handle too many requests at a time so we need to
    // queue them.
    if (HTTPRequest.queue.length > 0 && data.indexOf(URL.OFFSET_PARAM) > -1) {
      // We check to see if the user requested the next/previews page twice
      // this is the only case we need to check as we check it before adding
      // every request so if 3 or more consecutive calls are made only the
      // latest is kept. There is no need for further checking, as other types
      // of request are more naturally stoped from queueing elsewhere.
      if (HTTPRequest.queue[HTTPRequest.queue.length - 1].data.indexOf(
          URL.OFFSET_PARAM) > -1) {
        // if this happens, we only keep the latest request arround
        HTTPRequest.queue.pop();
      }
    }
    HTTPRequest.queue.push({ requestObject: this, data: data, handler: handler, failedHandler: failedHandler} );
    return;
  }
  try {
    loading.visible = true;
  } catch(e) {
    // rare occurance, if the details view is just closing
    return;
  }

  // Check if network is online.
  if (!framework.system.network.online) {
    this.onFailure();
    return;
  }

  this.handler = handler;
  this.failedHandler = failedHandler;
  this.packet.abort();
  this.packet.onreadystatechange = this.receivedData.bind(this);
  if (data) {
    this.packet.open('POST', this.url, true);
    this.packet.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');    
  } else {
    this.packet.open('GET', this.url, true);    
  }

  // add auth token if one exists
  try {
    if (loginSession.token) {
      this.packet.setRequestHeader('Authorization', 'GoogleLogin auth='+loginSession.token);    
    }
  } catch(e) {}

  this.packet.setRequestHeader('cookie', 'none');
  this.packet.setRequestHeader('Cache-Control', 'no-cache, no-transform');
  this.packet.setRequestHeader('Host', this.host);
  this.packet.send(data);

  this.clearTimeout();  
  this.timeoutTimer = view.setTimeout(this.onTimeout.bind(this), CONNECTION.TIMEOUT);

  HTTPRequest.available = false;
};

HTTPRequest.prototype.clearTimeout = function() {
  if (this.timeoutTimer) {
    view.clearTimeout(this.timeoutTimer);
    this.timeoutTimer = null;
  }
};

HTTPRequest.prototype.onTimeout = function() {
  debug.error('Request timed out.');
  this.packet.abort();  
  setTimeout(HTTPRequest.finishedGracePeriod, CONNECTION.TIME_BETWEEN_REQUESTS);
  this.hideLoading();
  this.onFailure();
};

HTTPRequest.prototype.hideLoading = function() {
  try {
    loading.visible = false;
  } catch(e) {
    // rare occurance, if the details view is closing when receiving data
    debug.warning('Could not hide loading image.');
  }  
};

HTTPRequest.prototype.onFailure = function() {
  if (this.failedHandler !== null) {
    var status = this.packet.readyState == 4 ? this.packet.status : 0;
    this.failedHandler(status, this.packet.responseText);
  } else {
    errorMessage.display(SERVER_OR_NETWORK_ERROR);
  }
};

HTTPRequest.prototype.receivedData = function() {
  if (!this.packet) {
    return;
  }
  if (this.packet.readyState != 4) {
    return;
  }
  this.hideLoading();  
  this.clearTimeout();  
  setTimeout(HTTPRequest.finishedGracePeriod, CONNECTION.TIME_BETWEEN_REQUESTS);
  if (this.packet.status != 200) {
    debug.error('A transfer error has occured !');
    this.onFailure();
    return;
  }
  if (this.handler !== null) {
    this.handler(this.packet.responseText);
  }
};
