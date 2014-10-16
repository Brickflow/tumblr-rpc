'use strict';

var _ = require('lodash');
var config = require('../config');
var credentials = _.defaults(config.get('RABBITMQ_CREDENTIALS') || {},
    { login: 'guest', password: 'guest', host: 'localhost', port: 5672 });
var tumblrActions = [
  'userInfo', 'dashboard', 'likes', 'following',
  'follow', 'unfollow', 'like', 'unlike',
  'blogInfo', 'posts', 'avatar', 'blogLikes', 'followers',
  'queue', 'drafts', 'submissions',
  'edit', 'reblog', 'deletePost', 'photo', 'quote',
  'text', 'link', 'chat', 'audio', 'video',
  'tagged'
];

var rpc = require('amqp-rpc').factory({
  url: 'amqp://' +
      credentials.login + ':' + credentials.password + '@' +
      credentials.host  + ':' + credentials.port
});

function query(action, credentials) {
  var args = Array.prototype.slice.call(arguments, 0);
  var hasCb = typeof _.last(args)=== 'function';
  var cb = hasCb ? _.last(args) : _.noop;
  var params = args.slice(2, hasCb ? -1 : 0);

  var rpcArgs = {
    action: action,
    credentials: _.omit(credentials, 'logger'),
    params: params
  };
  rpc.call('tumblr-rpc', rpcArgs, cb);
}

function createClient(credentials) {
  return _(tumblrActions).zipObject().mapValues(function (x, action) {
    return _.partial(query, action, credentials);
  }).value();
}

function self(credentials) {
  return createClient(credentials);
}

self.createClient = createClient;

module.exports = self;