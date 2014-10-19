'use strict';
var _ = require('lodash');
var amqpRPC = require('amqp-rpc');
var tumblr = require('tumblr-pool.js');

var dummyLogger = require('./dummyLogger');
//var measure = require('./measure');

module.exports = function listen(options) {
  options = _.defaults(options || {}, {
    queueName: 'tumblr-rpc',
    logger: dummyLogger
  });
  var rpc = amqpRPC.factory({
    url: options.url
  });
  rpc.on(options.queueName, function(task, cb) {
//    var dt = measure.time('tumblr-rpc', true);
    var timeKey = 'tumblr-rpc@' + process.hrtime().join('-');
    console.time(timeKey);

    var client = tumblr.createClient(_.assign(task.credentials, {
      logger: options.logger
    }));
    client[task.action].apply(tumblr, task.params.concat([function(err, res) {
      options.logger[err ? 'error' : 'info']('tumblr-rpc-api-response', {
        action: task.action,
        // params: task.params,
        doneAt: new Date()
//        queryDuration: dt.end()
      });
      console.timeEnd(timeKey);
      cb(err, res);
    }]));
  });
};