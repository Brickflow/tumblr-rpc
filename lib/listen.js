'use strict';
var _ = require('lodash');
var amqpRPC = require('amqp-rpc');
var dummyLogger = require('./dummyLogger');
var tumblr = require('tumblr-pool.js');

module.exports = function listen(options) {
  options = _.defaults(options || {}, {
    queueName: 'tumblr-rpc',
    config: { get: function() { return null; }},
    logger: dummyLogger
  });
  var rpc = amqpRPC.factory({
    url: options.url
  });
  rpc.on(options.queueName, function(task, cb) {
    var client = tumblr.createClient(_.assign(task.credentials, {
      logger: options.logger
    }));
    client[task.action].apply(tumblr, task.params.concat([function(err, res) {
      cb(err, res);
    }]));
  });
};