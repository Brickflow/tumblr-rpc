'use strict';
var _ = require('lodash');
var trackers = {};

function time(key) {
  var hash = Math.random().toString(16).split('.').pop();
  if (! trackers[key]) {
    trackers[key] = {};
  }
  trackers[key][hash] = {
    startAt: Date.now()
  };

  return {
    key: key,
    hash: hash,
    end: _.partial(timeEnd, key, hash)
  };
}

function timeEnd(key, hash) {
  if (trackers[key] && trackers[key][hash]) {
    var result = Date.now() - trackers[key][hash].startAt;
    delete trackers[key][hash];
    return result;
  }
}

module.exports = { time: time };