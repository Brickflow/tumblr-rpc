'use strict';
var _ = require('lodash');
var amqpRPC = require('amqp-rpc');
var tumblr = require('tumblr-pool.js');

var dummyLogger = require('./dummyLogger');
var measure = require('./measure');

module.exports = function listen(options) {
  options = _.defaults(options || {}, {
    queueName: 'tumblr-rpc',
    logger: dummyLogger,
    url: 'amqp://guest:guest@localhost:5672'
  });
  var rpc = amqpRPC.factory({
    url: options.url
  });
  rpc.on(options.queueName, function(task, cb) {
    var dt = measure.time('tumblr-rpc');
    var client = tumblr.createClient(_.assign(task.credentials, {
      logger: options.logger
    }));
    client[task.action].apply(tumblr, task.params.concat([function(err, res) {
      options.logger[err ? 'error' : 'info']('tumblr-rpc-api-response', {
        action: task.action,
        // params: task.params,
        doneAt: new Date(),
        running: dt.count('tumblr-rpc'),
        queryDuration: dt.end()
      });
      cb(err, res);
    }]));
  });
};