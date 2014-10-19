'use strict';

var _ = require('lodash');
var factory = require('amqp-rpc').factory;
var defaultLogger = require('./dummyLogger');
var TUMBLR_ACTIONS = [
  'userInfo', 'dashboard', 'likes', 'following',
  'follow', 'unfollow', 'like', 'unlike',
  'blogInfo', 'posts', 'avatar', 'blogLikes', 'followers',
  'queue', 'drafts', 'submissions',
  'edit', 'reblog', 'deletePost', 'photo', 'quote',
  'text', 'link', 'chat', 'audio', 'video',
  'tagged'
];

module.exports = function createClient(options) {
  _.defaults(options, {
    url: 'amqp://guest:guest@localhost:5672'
  });
  var logger = options.logger || defaultLogger;

  var rpc = factory({ url: options.url });

  function query(action, credentials) {
    var args = Array.prototype.slice.call(arguments, 0);
    var hasCb = typeof _.last(args)=== 'function';
    var cb = hasCb ? _.last(args) : _.noop;


    var params = args.slice(2, hasCb ? -1 : 0);
    var rpcParams = {
      action: action,
      credentials: credentials,
      params: params
    };
    logger.info('tumblr-rpc-call', rpcParams);
    rpc.call('tumblr-rpc', rpcParams, function(err, res) {
      logger.info('tumblr-rpc-response', rpcParams);
      cb(err, res);
    });
  }

  return _(TUMBLR_ACTIONS).zipObject().mapValues(function (x, action) {
    return _.partial(query, action, _.omit(options, 'url', 'logger'));
  }).value();
};



