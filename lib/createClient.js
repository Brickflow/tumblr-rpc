'use strict';
var _ = require('lodash');
var factory = require('amqp-rpc').factory;
var defaultLogger = require('./dummyLogger');
var measure = require('./measure');

var TUMBLR_ACTIONS = [
  'userInfo', 'dashboard', 'likes', 'following',
  'follow', 'unfollow', 'like', 'unlike',
  'blogInfo', 'posts', 'avatar', 'blogLikes', 'followers',
  'queue', 'drafts', 'submissions',
  'edit', 'reblog', 'deletePost', 'photo', 'quote',
  'text', 'link', 'chat', 'audio', 'video',
  'tagged'
];

var instances = {};
function getRPC(options) {
  if (!instances[options.url]) {
    instances[options.url] = factory(options);
  }
  return instances[options.url];
}

module.exports = function createClient(options) {
  options = _.defaults(options || {}, {
    queueName: 'tumblr-rpc',
    url: 'amqp://guest:guest@localhost:5672',
    exchange: 'tumblr_rpc_exchange'
  });
  var logger = options.logger || defaultLogger;

  var rpc = getRPC(_.pick(options, 'url', 'exchange'));

  function query(action, credentials) {
    var args = Array.prototype.slice.call(arguments, 0);
    var hasCb = typeof _.last(args) === 'function';
    var cb = hasCb ? _.last(args) : _.noop;
    var params = args.slice(2, hasCb ? -1 : undefined);
    var rpcParams = {
      action: action,
      credentials: credentials,
      params: params
    };
    logger.info(options.queueName + '-call', rpcParams);
    var dt = measure.time('tumblr-rpc-client');
    rpc.call(options.queueName, rpcParams, function(err, res) {
      logger.info(options.queueName + '-response', _.assign(rpcParams, {
        running: dt.count('tumblr-rpc-client'),
        duration: dt.end()
      }));
      cb(err, res);
    });
  }

  return _(TUMBLR_ACTIONS).zipObject().mapValues(function (x, action) {
    return _.partial(query, action, _.omit(options, 'url', 'queueName', 'logger'));
  }).value();
};



