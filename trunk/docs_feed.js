DocsFeed.FEED_URL = 'https://docs.google.com/feeds/documents/private/full';
DocsFeed.MAX_RESULTS_PARAM = 'max-results';
DocsFeed.MAX_RESULTS = 25;
DocsFeed.SEARCH_PARAM ='q';
DocsFeed.START_INDEX_PARAM = 'start-index';

function DocsFeed() {
}

DocsFeed.prototype.buildFeedUrl = function(startIndex, opt_searchQuery) {
  var params = {};
  params[DocsFeed.MAX_RESULTS_PARAM] = DocsFeed.MAX_RESULTS;
  params[DocsFeed.START_INDEX_PARAM] = startIndex;

  if (opt_searchQuery) {
    params[DocsFeed.SEARCH_PARAM] = opt_searchQuery;
  }

  return DocsFeed.FEED_URL + '?' + buildQueryString(params);
};

DocsFeed.prototype.retrieve = function(callback, failback) {
  this.retrieveChunk(1, callback, failback);
};

DocsFeed.prototype.search = function(query, callback, failback) {
  this.retrieveChunk(1, callback, failback, query);
};

DocsFeed.STOP_RETRIEVE_THRESHOLD = 50;

DocsFeed.prototype.retrieveChunk = function(startIndex, callback, failback,
    opt_searchQuery) {
  if (startIndex >= DocsFeed.STOP_RETRIEVE_THRESHOLD) {
    // Don't continue if past the threshold.
    return;
  }

  var url = this.buildFeedUrl(startIndex, opt_searchQuery);

  g_authHttpRequest.connect(url, null, this.onRetrieve.bind(this, callback),
      this.onError.bind(this, failback));
};

DocsFeed.prototype.onRetrieve = function(response, callback) {
  debug.trace(response);
  callback();
};

DocsFeed.prototype.onError = function(status, response, failback) {
  debug.trace(status);
  failback();
};
